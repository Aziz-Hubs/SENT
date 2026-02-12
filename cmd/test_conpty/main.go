package main

import (
	"fmt"
	"io"
	"log"
	"time"

	"github.com/UserExistsError/conpty"
)

func main() {
	log.Println("Starting ConPTY test...")

	cpty, err := conpty.Start("powershell.exe")
	if err != nil {
		log.Fatalf("Failed to start conpty: %v", err)
	}
	defer cpty.Close()

	log.Println("ConPTY started. Writing 'dir' command...")

	// Wait for prompt
	time.Sleep(1 * time.Second)

	// Write command
	_, err = cpty.Write([]byte("dir\r\n"))
	if err != nil {
		log.Fatalf("Failed to write to conpty: %v", err)
	}

	// Read output
	buf := make([]byte, 1024)
	for i := 0; i < 5; i++ {
		n, err := cpty.Read(buf)
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
