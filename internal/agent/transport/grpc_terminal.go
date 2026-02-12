package transport

import (
	"context"
	"io"
	"log"

	"sent-platform/internal/agent/terminal"
	sentpulsev1 "sent-platform/pkg/proto/sentpulse/v1"
	"sent-platform/pkg/proto/sentpulse/v1/sentpulsev1connect"
)

// TerminalClient handles the gRPC bidirectional stream for terminal sessions.
type TerminalClient struct {
	client  sentpulsev1connect.AgentServiceClient
	session *terminal.Session
}

func NewTerminalClient(client sentpulsev1connect.AgentServiceClient) *TerminalClient {
	return &TerminalClient{
		client: client,
	}
}

// StartSession initiates a PTY session and streams it to the backend via gRPC.
func (t *TerminalClient) StartSession(ctx context.Context, sessionID string) error {
	log.Printf("Starting terminal session (gRPC): %s", sessionID)

	// 1. Create PTY
	s, err := terminal.NewSession(sessionID)
	if err != nil {
		return err
	}
	t.session = s
	defer t.session.Close()

	// 2. Open Bidi Stream
	// Agent SENDS TerminalOutput, RECEIVES TerminalInput
	stream := t.client.StreamTerminal(ctx)
	defer stream.CloseRequest()

	// 3. Identification (First message)
	if err := stream.Send(&sentpulsev1.TerminalOutput{
		SessionId: sessionID,
		Data:      []byte(""), // Init
	}); err != nil {
		return err
	}

	// Channel to signal done
	errChan := make(chan error, 2)

	// 4. Handle Incoming (Backend -> Agent -> PTY)
	go func() {
		for {
			msg, err := stream.Receive()
			if err != nil {
				if err == io.EOF {
					log.Printf("Terminal stream closed by backend")
					errChan <- nil
					return
				}
				log.Printf("Terminal stream receive error: %v", err)
				errChan <- err
				return
			}

			// Handle Resize
			if msg.Resize != nil {
				log.Printf("Resizing terminal: %vx%v", msg.Resize.Rows, msg.Resize.Cols)
				if err := t.session.Resize(msg.Resize.Rows, msg.Resize.Cols); err != nil {
					log.Printf("Resize failed: %v", err)
				}
			}

			// Handle Data
			if len(msg.Data) > 0 {
				_, _ = t.session.Write(msg.Data)
			}
		}
	}()

	// 5. Handle Outgoing (PTY -> Agent -> Backend)
	go func() {
		buf := make([]byte, 2048)
		for {
			n, err := t.session.Read(buf)
			if err != nil {
				if err == io.EOF {
					log.Printf("PTY EOF")
					errChan <- nil
					return
				}
				log.Printf("PTY Read error: %v", err)
				errChan <- err
				return
			}

			if n > 0 {
				if err := stream.Send(&sentpulsev1.TerminalOutput{
					SessionId: sessionID,
					Data:      buf[:n],
				}); err != nil {
					log.Printf("Terminal stream send error: %v", err)
					errChan <- err
					return
				}
			}
		}
	}()

	// Wait for error or completion
	select {
	case <-ctx.Done():
		return ctx.Err()
	case err := <-errChan:
		return err
	}
}
