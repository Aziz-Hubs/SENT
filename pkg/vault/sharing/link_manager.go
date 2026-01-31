package sharing

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"

	"sent/ent"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type ShareConfig struct {
	VaultItemID int
	TenantID    int
	CreatorID   int
	ExpiresIn   time.Duration
	Password    string // Optional
}

type LinkManager struct {
	db *ent.Client
}

func NewLinkManager(db *ent.Client) *LinkManager {
	return &LinkManager{db: db}
}

// CreateSecureLink generates a new secure link.
func (chk *LinkManager) CreateSecureLink(ctx context.Context, config ShareConfig) (string, error) {
	// 1. Generate Token
	token := uuid.New().String()
	
	// 2. Hash Password if provided
	var pwHash string
	if config.Password != "" {
		bytes, err := bcrypt.GenerateFromPassword([]byte(config.Password), bcrypt.DefaultCost)
		if err != nil {
			return "", fmt.Errorf("failed to hash password: %w", err)
		}
		pwHash = string(bytes)
	}

	// 3. Store in DB
	err := chk.db.VaultShareLink.Create().
		SetToken(token).
		SetItemID(config.VaultItemID).
		SetTenantID(config.TenantID).
		SetExpiresAt(time.Now().Add(config.ExpiresIn)).
		SetNillablePasswordHash(&pwHash).
		Exec(ctx)
		
	if err != nil {
		return "", fmt.Errorf("failed to create share link: %w", err)
	}

	return "https://sent.app/share/" + token, nil
}

// GenerateRandomPassword creates a secure random string.
func GenerateRandomPassword(length int) (string, error) {
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes)[:length], nil
}
