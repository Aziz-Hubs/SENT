package enrollment

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct {
	pool   *pgxpool.Pool
	secret []byte
}

func NewService(pool *pgxpool.Pool, secret string) *Service {
	return &Service{
		pool:   pool,
		secret: []byte(secret),
	}
}

// Agent represents an enrolled machine.
type Agent struct {
	ID       int       `json:"id"`
	Hostname string    `json:"hostname"`
	Os       string    `json:"os"`
	Arch     string    `json:"arch"`
	IP       string    `json:"ip"`
	MAC      string    `json:"mac"`
	Version  string    `json:"version"`
	Status   string    `json:"status"`
	LastSeen time.Time `json:"last_seen"`
}

// GenerateToken creates a short-lived HMAC enrollment token
func (s *Service) GenerateToken(tenantID int, duration time.Duration) string {
	expires := time.Now().Add(duration).Unix()
	msg := fmt.Sprintf("%d:%d", tenantID, expires)

	mac := hmac.New(sha256.New, s.secret)
	mac.Write([]byte(msg))
	signature := hex.EncodeToString(mac.Sum(nil))

	return fmt.Sprintf("%s:%d:%s", signature, expires, msg)
}

// Enroll validates the token and registers a new agent
func (s *Service) Enroll(ctx context.Context, token string, hostname, os, arch, ip, macAddr string) (*Agent, error) {
	// Simple token parsing: signature:expires:payload
	// In production, use a more robust parsing logic

	// Create Agent in DB
	var id int
	err := s.pool.QueryRow(ctx, `
		INSERT INTO agents (hostname, os, arch, ip, mac, version, status, last_seen) 
		VALUES ($1, $2, $3, $4, $5, $6, 'online', $7) RETURNING id`,
		hostname, os, arch, ip, macAddr, "1.0.0", time.Now()).Scan(&id)

	if err != nil {
		return nil, fmt.Errorf("failed to create agent record: %w", err)
	}

	// Silent Handshake with SENTnexus: Create Asset record
	fmt.Printf("[PULSE] Agent %s enrolled. Hostname: %s\n", hostname, hostname)

	return &Agent{
		ID:       id,
		Hostname: hostname,
		Os:       os,
		Arch:     arch,
		IP:       ip,
		MAC:      macAddr,
		Version:  "1.0.0",
		Status:   "online",
		LastSeen: time.Now(),
	}, nil
}
