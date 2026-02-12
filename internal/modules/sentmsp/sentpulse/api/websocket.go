package api

import (
	"encoding/json"
	"log"
	"net/http"

	sentpulsev1 "sent-platform/pkg/proto/sentpulse/v1"

	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all for dev
	},
}

// HandleTerminalWebSocket upgrades HTTP to WS and bridges to Agent session.
// This is the Frontend-facing WebSocket endpoint.
func (s *AgentService) HandleTerminalWebSocket(c echo.Context) error {
	sessionID := c.QueryParam("session_id")
	if sessionID == "" {
		return c.String(http.StatusBadRequest, "Missing session_id")
	}

	// 1. Get Session
	session := GlobalSessionManager.GetSession(sessionID)
	if session == nil {
		return c.String(http.StatusNotFound, "Session not found or agent not connected")
	}

	// 2. Upgrade to WebSocket
	ws, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		log.Printf("WS Upgrade failed: %v", err)
		return err
	}
	defer ws.Close()

	log.Printf("Frontend connected to session: %s", sessionID)

	// Channel to signal error/close
	done := make(chan struct{})

	// Goroutine 1: Backend Session Output -> Frontend WS
	go func() {
		defer close(done)
		for {
			select {
			case <-session.Done:
				ws.WriteMessage(websocket.TextMessage, []byte("Agent disconnected"))
				return
			case output := <-session.OutputChan:
				// Forward data from Agent to Frontend
				if err := ws.WriteMessage(websocket.BinaryMessage, output.Data); err != nil {
					log.Printf("WS Write error: %v", err)
					return
				}
			}
		}
	}()

	// Goroutine 2: Frontend WS -> Backend Session Input
	for {
		mt, message, err := ws.ReadMessage()
		if err != nil {
			log.Printf("WS Read error: %v", err)
			break
		}

		if mt == websocket.BinaryMessage {
			// Forward input from Frontend to Agent
			session.InputChan <- &sentpulsev1.TerminalInput{
				SessionId: sessionID,
				Data:      message,
			}
		} else if mt == websocket.TextMessage {
			// Handle commands (e.g. Resize)
			type Command struct {
				Type string `json:"type"`
				Rows uint32 `json:"rows"`
				Cols uint32 `json:"cols"`
			}
			var cmd Command
			if err := json.Unmarshal(message, &cmd); err == nil && cmd.Type == "resize" {
				session.InputChan <- &sentpulsev1.TerminalInput{
					SessionId: sessionID,
					Resize: &sentpulsev1.TerminalResize{
						Rows: cmd.Rows,
						Cols: cmd.Cols,
					},
				}
			}
		}
	}

	return nil
}

// HandleAgentWebSocket is the Agent-facing WebSocket endpoint.
// This creates the session and bridges Agent PTY output <-> Frontend input.
func (s *AgentService) HandleAgentWebSocket(c echo.Context) error {
	sessionID := c.QueryParam("session_id")
	if sessionID == "" {
		return c.String(http.StatusBadRequest, "Missing session_id")
	}

	// 1. Upgrade to WebSocket
	ws, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
	if err != nil {
		log.Printf("Agent WS Upgrade failed: %v", err)
		return err
	}
	defer ws.Close()

	log.Printf("Agent connected via WebSocket for session: %s", sessionID)

	// 2. Create/Get Session
	session := GlobalSessionManager.CreateSession(sessionID)

	// Ensure cleanup on disconnect
	defer func() {
		log.Printf("Agent disconnected from session: %s", sessionID)
		GlobalSessionManager.RemoveSession(sessionID)
	}()

	// Channel to signal error
	errChan := make(chan error, 2)

	// Goroutine 1: Agent WS (PTY Output) -> Session Output (For Frontend)
	go func() {
		for {
			_, message, err := ws.ReadMessage()
			if err != nil {
				errChan <- err
				return
			}
			if len(message) > 0 {
				session.OutputChan <- &sentpulsev1.TerminalOutput{
					SessionId: sessionID,
					Data:      message,
				}
			}
		}
	}()

	// Goroutine 2: Session Input (Frontend) -> Agent WS (PTY Input)
	go func() {
		for {
			select {
			case <-session.Done:
				return
			case input := <-session.InputChan:
				if err := ws.WriteMessage(websocket.BinaryMessage, input.Data); err != nil {
					errChan <- err
					return
				}
			}
		}
	}()

	// Wait for error or context done
	select {
	case <-c.Request().Context().Done():
		return c.Request().Context().Err()
	case err := <-errChan:
		log.Printf("Session %s error: %v", sessionID, err)
		return nil
	case <-session.Done:
		return nil
	}
}
