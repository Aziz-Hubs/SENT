package vault

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"time"

	"sent/ent"
	"sent/ent/credential"
	"sent/ent/onetimelink"
	"sent/pkg/crypto"
	"sent/pkg/database"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type Service struct {
	client *ent.Client
}

func NewService(client *ent.Client) *Service {
	return &Service{client: client}
}

func (s *Service) CreateOneTimeLink(ctx context.Context, tenantID int, credID int, duration time.Duration) (string, error) {
	tokenBytes := make([]byte, 32)
	if _, err := rand.Read(tokenBytes); err != nil {
		return "", err
	}
	token := hex.EncodeToString(tokenBytes)

	otl, err := s.client.OneTimeLink.Create().
		SetTenantID(tenantID).
		SetCredentialID(credID).
		SetToken(token).
		SetExpiresAt(time.Now().Add(duration)).
		Save(ctx)

	if err != nil {
		return "", err
	}

	// Audit global log
	database.LogAuditRecord(ctx, s.client, tenantID, "SENTnexus", "create_otl", "system", map[string]interface{}{
		"credential_id": credID,
		"otl_id":        otl.ID,
	})

	return token, nil
}

func (s *Service) ConsumeOneTimeLink(ctx context.Context, token string) (string, error) {
	otl, err := s.client.OneTimeLink.Query().
		Where(onetimelink.TokenEQ(token)).
		WithCredential().
		WithTenant().
		Only(ctx)
	if err != nil {
		return "", fmt.Errorf("link invalid or expired")
	}

	if otl.Consumed || time.Now().After(otl.ExpiresAt) {
		return "", errors.New("link has expired or already been consumed")
	}

	// Mark as consumed
	err = s.client.OneTimeLink.UpdateOne(otl).
		SetConsumed(true).
		Exec(ctx)
	if err != nil {
		return "", err
	}

	// Audit global log
	database.LogAuditRecord(ctx, s.client, otl.Edges.Tenant.ID, "SENTnexus", "consume_otl", "anonymous", map[string]interface{}{
		"credential_id": otl.Edges.Credential.ID,
	})

	plainText, err := crypto.Decrypt(string(otl.Edges.Credential.PasswordEncrypted))
	if err != nil {
		return "", err
	}

	return plainText, nil
}

type RevealRequest struct {
	CredentialID int
	TenantID     int
	ActorID      string
	ReasonCode   string
	TicketID     string
	Action       string // "reveal" or "copy"
}

func (s *Service) Reveal(ctx context.Context, req RevealRequest) (string, error) {
	// 1. Fetch credential
	cred, err := s.client.Credential.Query().
		Where(credential.IDEQ(req.CredentialID)).
		Only(ctx)
	if err != nil {
		return "", fmt.Errorf("credential not found: %w", err)
	}

	// 2. Audit the action (Nexus-specific)
	_, err = s.client.NexusAudit.Create().
		SetAction(req.Action).
		SetActorID(req.ActorID).
		SetCredentialID(fmt.Sprintf("%d", req.CredentialID)).
		SetReasonCode(req.ReasonCode).
		SetTicketID(req.TicketID).
		SetTimestamp(time.Now()).
		Save(ctx)
	if err != nil {
		return "", fmt.Errorf("failed to audit action: %w", err)
	}

	// 3. Audit the action (Global)
	database.LogAuditRecord(ctx, s.client, req.TenantID, "SENTnexus", req.Action, req.ActorID, map[string]interface{}{
		"credential_id": req.CredentialID,
		"reason_code":   req.ReasonCode,
		"ticket_id":     req.TicketID,
	})

	// 4. Decrypt
	plainText, err := crypto.Decrypt(string(cred.PasswordEncrypted))
	if err != nil {
		return "", fmt.Errorf("failed to decrypt: %w", err)
	}

	// 5. Update last_revealed_at
	err = s.client.Credential.UpdateOne(cred).
		SetLastRevealedAt(time.Now()).
		Exec(ctx)
	if err != nil {
		// Log error but don't fail reveal
		fmt.Printf("Warning: failed to update last_revealed_at: %v\n", err)
	}

	return plainText, nil
}

func (s *Service) CopyToClipboard(ctx context.Context, wailsCtx context.Context, req RevealRequest) error {
	req.Action = "copy"
	text, err := s.Reveal(ctx, req)
	if err != nil {
		return err
	}

	runtime.ClipboardSetText(wailsCtx, text)
	go func() {
		select {
		case <-time.After(30 * time.Second):
			runtime.ClipboardSetText(wailsCtx, "")
		case <-wailsCtx.Done():
			return
		}
	}()
	return nil
}

func (s *Service) Create(ctx context.Context, tenantID int, name, username, password string, actorID string, assetID *int) (*ent.Credential, error) {
	encrypted, err := crypto.Encrypt(password)
	if err != nil {
		return nil, err
	}

	builder := s.client.Credential.Create().
		SetTenantID(tenantID).
		SetName(name).
		SetUsername(username).
		SetPasswordEncrypted([]byte(encrypted))

	if assetID != nil {
		builder.SetAssetID(*assetID)
	}

	cred, err := builder.Save(ctx)
	if err != nil {
		return nil, err
	}

	// Audit global log
	database.LogAuditRecord(ctx, s.client, tenantID, "SENTnexus", "create_credential", actorID, map[string]interface{}{
		"credential_id": cred.ID,
		"name":          name,
	})

	return cred, nil
}

