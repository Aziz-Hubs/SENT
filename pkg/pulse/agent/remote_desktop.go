package agent

import (
	"bytes"
	"encoding/json"
	"image/jpeg"
	"log"
	"time"

	"github.com/gorilla/websocket"
	"github.com/kbinani/screenshot"
)

type RemoteDesktopSession struct {
	serverURL string
	agentID   string
	stopChan  chan struct{}
}

type InputEvent struct {
	Type   string `json:"type"`   // mousemove, mousedown, mouseup, keydown, keyup
	X      int    `json:"x"`      // Mouse X
	Y      int    `json:"y"`      // Mouse Y
	Button string `json:"button"` // left, right, middle
	Key    string `json:"key"`    // e.g. "a", "enter", "backspace"
}

func NewRemoteDesktopSession(serverURL, agentID string) *RemoteDesktopSession {
	return &RemoteDesktopSession{
		serverURL: serverURL,
		agentID:   agentID,
		stopChan:  make(chan struct{}),
	}
}

func (s *RemoteDesktopSession) Start() {
	log.Printf("[RDP] Connecting to %s...", s.serverURL)
	conn, _, err := websocket.DefaultDialer.Dial(s.serverURL, nil)
	if err != nil {
		log.Printf("[RDP] Connection failed: %v", err)
		return
	}
	defer conn.Close()

	// Start Screen Capture Loop
	go s.captureLoop(conn)

	// Start Input Listen Loop
	for {
		select {
		case <-s.stopChan:
			return
		default:
			_, message, err := conn.ReadMessage()
			if err != nil {
				log.Printf("[RDP] Read error: %v", err)
				return
			}
			
			var event InputEvent
			if err := json.Unmarshal(message, &event); err != nil {
				continue
			}
			s.handleInput(event)
		}
	}
}

func (s *RemoteDesktopSession) Stop() {
	close(s.stopChan)
}

func (s *RemoteDesktopSession) captureLoop(conn *websocket.Conn) {
	ticker := time.NewTicker(200 * time.Millisecond) // 5 FPS
	defer ticker.Stop()

	for {
		select {
		case <-s.stopChan:
			return
		case <-ticker.C:
			// Capture Screen
			n := screenshot.NumActiveDisplays()
			if n == 0 { continue }
			
			// Capture Display 0 (Primary)
			bounds := screenshot.GetDisplayBounds(0)
			img, err := screenshot.CaptureRect(bounds)
			if err != nil {
				log.Printf("[RDP] Capture error: %v", err)
				continue
			}

			// Encode JPEG
			var buf bytes.Buffer
			if err := jpeg.Encode(&buf, img, &jpeg.Options{Quality: 50}); err != nil { 
				continue
			}

			// Send Binary Frame
			if err := conn.WriteMessage(websocket.BinaryMessage, buf.Bytes()); err != nil {
				log.Printf("[RDP] Write error: %v", err)
				return
			}
		}
	}
}

func (s *RemoteDesktopSession) handleInput(e InputEvent) {
	// Execute in goroutine to avoid blocking the input reader
	go func() {
		// Recover from any input panic
		defer func() {
			if r := recover(); r != nil {
				log.Printf("[RDP] Input panic: %v", r)
			}
		}()

		if currentInputController == nil {
			return
		}

		switch e.Type {
		case "mousemove":
			currentInputController.Move(e.X, e.Y)
		case "mousedown":
			btn := e.Button
			if btn == "" { btn = "left" }
			currentInputController.MouseToggle(btn, "down")
		case "mouseup":
			btn := e.Button
			if btn == "" { btn = "left" }
			currentInputController.MouseToggle(btn, "up")
		case "keydown":
			if e.Key != "" {
				currentInputController.KeyToggle(e.Key, "down")
			}
		case "keyup":
			if e.Key != "" {
				currentInputController.KeyToggle(e.Key, "up")
			}
		}
	}()
}
