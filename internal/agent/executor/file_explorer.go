package executor

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"runtime"
	"sync"

	sentpulsev1 "sent-platform/pkg/proto/sentpulse/v1"
	"sent-platform/pkg/proto/sentpulse/v1/sentpulsev1connect"

	connect "connectrpc.com/connect"

	"google.golang.org/protobuf/types/known/timestamppb"
)

// HandleFileExplorer connects to the backend and serves file explorer requests.
func HandleFileExplorer(ctx context.Context, client sentpulsev1connect.AgentServiceClient, sessionID string) error {
	log.Printf("Starting File Explorer session: %s", sessionID)

	stream := client.StreamFileExplorer(ctx)
	defer stream.CloseRequest()

	// Mutex to protect stream.Send from concurrent access
	var sendMu sync.Mutex

	// 1. Identify device/session
	if err := stream.Send(&sentpulsev1.FileExplorerMessage{
		SessionId: sessionID,
		// No payload for initial handshake
	}); err != nil {
		return fmt.Errorf("failed to send handshake: %w", err)
	}

	log.Printf("File Explorer handshake sent for session: %s", sessionID)

	// 2. Loop for requests - handle sequentially to avoid stream send races
	for {
		select {
		case <-ctx.Done():
			log.Printf("File Explorer context cancelled for session: %s", sessionID)
			return ctx.Err()
		default:
		}

		msg, err := stream.Receive()
		if err != nil {
			return fmt.Errorf("stream closed: %w", err)
		}

		log.Printf("File Explorer received request: type=%T requestId=%s", msg.Payload, msg.RequestId)

		// Handle request sequentially for stream safety
		handleFileRequest(&sendMu, stream, msg)
	}
}

func handleFileRequest(sendMu *sync.Mutex, stream *connect.BidiStreamForClient[sentpulsev1.FileExplorerMessage, sentpulsev1.FileExplorerMessage], msg *sentpulsev1.FileExplorerMessage) {
	// Process request
	var responsePayload interface{}
	var err error

	switch payload := msg.Payload.(type) {
	case *sentpulsev1.FileExplorerMessage_ListReq:
		log.Printf("Listing directory: %s", payload.ListReq.Path)
		responsePayload, err = listDirectory(payload.ListReq)
	case *sentpulsev1.FileExplorerMessage_ReadReq:
		log.Printf("Reading file: %s", payload.ReadReq.Path)
		responsePayload, err = readFile(payload.ReadReq)
	default:
		err = fmt.Errorf("unknown request type: %T", msg.Payload)
	}

	// Construct response message
	respMsg := &sentpulsev1.FileExplorerMessage{
		SessionId: msg.SessionId,
		RequestId: msg.RequestId, // Echo request ID
	}

	if err != nil {
		log.Printf("File Explorer error for request %s: %v", msg.RequestId, err)
		respMsg.Payload = &sentpulsev1.FileExplorerMessage_Error{
			Error: &sentpulsev1.FileError{
				Code:    500,
				Message: err.Error(),
			},
		}
	} else {
		// Set payload based on type
		switch p := responsePayload.(type) {
		case *sentpulsev1.ListDirectoryResponse:
			log.Printf("Returning %d entries for path: %s", len(p.Entries), p.CurrentPath)
			respMsg.Payload = &sentpulsev1.FileExplorerMessage_ListResp{
				ListResp: p,
			}
		case *sentpulsev1.ReadFileResponse:
			log.Printf("Returning file content, size=%d", p.SizeBytes)
			respMsg.Payload = &sentpulsev1.FileExplorerMessage_ReadResp{
				ReadResp: p,
			}
		}
	}

	// Send response under mutex lock
	sendMu.Lock()
	defer sendMu.Unlock()
	if sendErr := stream.Send(respMsg); sendErr != nil {
		log.Printf("Failed to send file explorer response: %v", sendErr)
	}
}

func listDirectory(req *sentpulsev1.ListDirectoryRequest) (*sentpulsev1.ListDirectoryResponse, error) {
	path := req.Path
	if path == "" {
		// Default path
		if runtime.GOOS == "windows" {
			path = "C:\\"
		} else {
			path = "/"
		}
	}

	log.Printf("Reading directory: %s", path)

	entries, err := os.ReadDir(path)
	if err != nil {
		return nil, fmt.Errorf("failed to read directory %s: %w", path, err)
	}

	var pbEntries []*sentpulsev1.FileSystemEntry
	for _, entry := range entries {
		info, err := entry.Info()
		if err != nil {
			continue // Skip unreadable
		}

		pbEntry := &sentpulsev1.FileSystemEntry{
			Name:        entry.Name(),
			Path:        filepath.Join(path, entry.Name()),
			IsDirectory: entry.IsDir(),
			SizeBytes:   info.Size(),
			ModTime:     timestamppb.New(info.ModTime()),
			Mode:        uint32(info.Mode()),
		}

		pbEntries = append(pbEntries, pbEntry)
	}

	parentPath := filepath.Dir(path)
	if parentPath == path {
		parentPath = "" // We are at root
	}

	log.Printf("Directory %s: %d entries, parent=%s", path, len(pbEntries), parentPath)

	return &sentpulsev1.ListDirectoryResponse{
		CurrentPath: path,
		ParentPath:  parentPath,
		Entries:     pbEntries,
	}, nil
}

func readFile(req *sentpulsev1.ReadFileRequest) (*sentpulsev1.ReadFileResponse, error) {
	path := req.Path
	log.Printf("Reading file content: %s", path)

	info, err := os.Stat(path)
	if err != nil {
		return nil, fmt.Errorf("failed to stat file %s: %w", path, err)
	}
	if info.IsDir() {
		return nil, fmt.Errorf("path is a directory")
	}
	if info.Size() > 100*1024*1024 { // 100MB limit
		return nil, fmt.Errorf("file too large (>100MB)")
	}

	content, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("failed to read file %s: %w", path, err)
	}

	return &sentpulsev1.ReadFileResponse{
		Content:   content,
		SizeBytes: int64(len(content)),
		MimeType:  "application/octet-stream",
	}, nil
}
