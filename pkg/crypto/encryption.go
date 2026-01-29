package crypto

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"os"
)

const (
	// defaultKey is a fallback key for development ONLY.
	// In production, this MUST be overridden by the SENT_ENCRYPTION_KEY environment variable.
	defaultKey = "SENT-ENCRYPTION-KEY-MUST-BE-32B!" 
	envKeyName = "SENT_ENCRYPTION_KEY"
)

// getSecretKey retrieves the encryption key from the environment or returns the default.
// It validates that the key length is suitable for AES-256 (32 bytes).
func getSecretKey() ([]byte, error) {
	key := os.Getenv(envKeyName)
	if key == "" {
		fmt.Println("[WARNING] Using default development encryption key. Do not use in production!")
		key = defaultKey
	}

	keyBytes := []byte(key)
	if len(keyBytes) != 32 {
		return nil, fmt.Errorf("invalid key length: expected 32 bytes, got %d", len(keyBytes))
	}

	return keyBytes, nil
}

// Encrypt encrypts a plain text string using AES-GCM (Galois/Counter Mode).
//
// @param plainText - The string to encrypt.
// @returns The Base64 encoded ciphertext or an error.
func Encrypt(plainText string) (string, error) {
	key, err := getSecretKey()
	if err != nil {
		return "", err
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		return "", fmt.Errorf("failed to create cipher block: %w", err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", fmt.Errorf("failed to create GCM: %w", err)
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", fmt.Errorf("failed to generate nonce: %w", err)
	}

	cipherText := gcm.Seal(nonce, nonce, []byte(plainText), nil)
	return base64.StdEncoding.EncodeToString(cipherText), nil
}

// Decrypt decrypts a Base64 encoded ciphertext string.
//
// @param encodedText - The Base64 encoded ciphertext.
// @returns The decrypted plain text or an error.
func Decrypt(encodedText string) (string, error) {
	key, err := getSecretKey()
	if err != nil {
		return "", err
	}

	data, err := base64.StdEncoding.DecodeString(encodedText)
	if err != nil {
		return "", fmt.Errorf("invalid base64 encoding: %w", err)
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		return "", fmt.Errorf("failed to create cipher block: %w", err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", fmt.Errorf("failed to create GCM: %w", err)
	}

	nonceSize := gcm.NonceSize()
	if len(data) < nonceSize {
		return "", errors.New("ciphertext too short")
	}

	nonce, cipherText := data[:nonceSize], data[nonceSize:]
	plainText, err := gcm.Open(nil, nonce, cipherText, nil)
	if err != nil {
		return "", fmt.Errorf("decryption failed: %w", err)
	}

	return string(plainText), nil
}
