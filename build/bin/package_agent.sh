#!/bin/bash
# SENT Gold Master Agent Packaging Script

set -e

VERSION="1.0.0-beta"
TARGET_DIR="build/dist"
BINARY_NAME="sent-agent"

mkdir -p $TARGET_DIR

echo "[BUILD] Packaging SENTpulse Agent v$VERSION..."

# 1. Build for Windows (AMD64)
echo "[BUILD] Compiling Windows MSI target..."
GOOS=windows GOARCH=amd64 go build -ldflags "-X main.Version=$VERSION" -o "$TARGET_DIR/$BINARY_NAME.exe" cmd/agent/main.go
# Placeholder for MSI wrapper: candle.exe/light.exe (Wix) or advanced installer.

# 2. Build for Linux (AMD64)
echo "[BUILD] Compiling Linux DEB target..."
GOOS=linux GOARCH=amd64 go build -ldflags "-X main.Version=$VERSION" -o "$TARGET_DIR/$BINARY_NAME" cmd/agent/main.go

echo "[BUILD] Packaging Complete. Distribution files located in $TARGET_DIR"
