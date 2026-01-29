package nexus

import (
	"testing"
	"sent/pkg/crypto"
	"os"
)

func TestAESGCMVaultMasking(t *testing.T) {
	// Set the environment variable for testing
	os.Setenv("SENT_ENCRYPTION_KEY", "thisis32byteslongsecretkey!!!!!!")
	defer os.Unsetenv("SENT_ENCRYPTION_KEY")

	plaintext := "my-secret-password"
	
	ciphertext, err := crypto.Encrypt(plaintext)
	if err != nil {
		t.Fatalf("Encryption failed: %v", err)
	}
	
	decrypted, err := crypto.Decrypt(ciphertext)
	if err != nil {
		t.Fatalf("Decryption failed: %v", err)
	}
	
	if decrypted != plaintext {
		t.Errorf("Decrypted text mismatch: expected %s, got %s", plaintext, decrypted)
	}
}