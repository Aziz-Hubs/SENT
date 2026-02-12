package main

import (
	"fmt"
	"io"
	"log"
	"time"

	"sent-platform/internal/agent/terminal"
)

func main() {
	log.Println("Starting PTY test...")

	session, err := terminal.NewSession("test-session")
	if err != nil {
		log.Fatalf("Failed to start session: %v", err)
	}
	defer session.Close()

	log.Println("Session started. Writing 'dir' command...")

	// Give it a moment to initialize
	time.Sleep(1 * time.Second)

	// Write command
	_, err = session.Write([]byte("dir\r\n"))
	if err != nil {
		log.Fatalf("Failed to write to pty: %v", err)
	}

	// Read output
	buf := make([]byte, 1024)
	for i := 0; i < 5; i++ {
		n, err := session.Read(buf)
		if err != nil {
			if err == io.EOF {
				break
			}
			log.Printf("Read error: %v", err)
			break
		}
		if n > 0 {
			fmt.Print(string(buf[:n]))
		}
		time.Sleep(500 * time.Millisecond)
	}

	log.Println("\nTest complete.")
}
