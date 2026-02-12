package main

import (
	"context"
	"log"
	"net/http"

	sentpulsev1 "sent-platform/pkg/proto/sentpulse/v1"
	"sent-platform/pkg/proto/sentpulse/v1/sentpulsev1connect"

	"connectrpc.com/connect"
)

func main() {
	client := sentpulsev1connect.NewDashboardServiceClient(
		http.DefaultClient,
		"http://localhost:8081",
		connect.WithGRPC(),
	)

	deviceID := "62d95293-d3bf-4ddb-a25f-0b0b0e1b1208"

	log.Printf("Triggering remote action on device: %s", deviceID)

	req := connect.NewRequest(&sentpulsev1.RunScriptRequest{
		DeviceId:     deviceID,
		InlineScript: "Write-Host 'Hello from Remote Actions MVP'; Get-Date",
		Language:     sentpulsev1.ScriptLanguage_SCRIPT_LANGUAGE_POWERSHELL.Enum(),
	})

	resp, err := client.RunScript(context.Background(), req)
	if err != nil {
		log.Fatalf("Failed to run script: %v", err)
	}

	log.Printf("Successfully created job: %s", resp.Msg.JobId)
}
