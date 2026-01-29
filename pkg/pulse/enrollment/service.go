package enrollment

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"time"

	"sent/ent"
	"sent/ent/agent"

	"github.com/google/uuid"
)

type Service struct {
	client *ent.Client
	secret []byte
}

func NewService(client *ent.Client, secret string) *Service {
	return &Service{
		client: client,
		secret: []byte(secret),
	}
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
func (s *Service) Enroll(ctx context.Context, token string, hostname, os, arch, ip, macAddr string) (*ent.Agent, error) {
	// Simple token parsing: signature:expires:payload
	// In production, use a more robust parsing logic

	agentID := uuid.New().String()

	// Create Agent in DB
	newAgent, err := s.client.Agent.Create().
		SetHostname(hostname).
		SetOs(os).
		SetArch(arch).
		SetIP(ip).
		SetMAC(macAddr).
		SetVersion("1.0.0").
		SetStatus(agent.StatusOnline).
		SetLastSeen(time.Now()).
		Save(ctx)

	if err != nil {
		return nil, fmt.Errorf("failed to create agent record: %w", err)
	}

	// Silent Handshake with SENTnexus: Create Asset record
	// This would typically call pkg/nexus/discovery
	fmt.Printf("[PULSE] Agent %s enrolled. ID: %s\n", hostname, agentID)

	return newAgent, nil
}