package agent

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/google/uuid"
)

// Global state for RDP session
var currentRDP *RemoteDesktopSession

// Run starts the SENT agent.
func Run() {
	fmt.Println("[AGENT] Starting SENT pulse agent...")

	// 1. Identify Agent (For MVP, generate or load UUID)
	agentID := getAgentID()
	log.Printf("[AGENT] Agent ID: %s", agentID)

	// 2. Initialize Components
	collector := NewCollector()
	cache, err := NewLocalCache("agent_cache.db")
	if err != nil {
		log.Fatalf("[AGENT] Failed to initialize cache: %v", err)
	}
	defer cache.Close()

	// 3. Connect to Real-time Hub
	// TODO: Get token from backend or use static for MVP
	client := NewPulseClient("ws://localhost:8000/connection/websocket", agentID, "")
	if err := client.Connect(); err != nil {
		log.Printf("[AGENT] Warning: Failed to connect to hub: %v. Data will be cached.", err)
	}
	defer client.Close()

	// 4. Setup Control Handler
	client.SubscribeControl(func(cmd string) {
		log.Printf("[AGENT] Received remote command: %s", cmd)
		switch cmd {
		case "reboot":
			log.Println("[AGENT] Rebooting system via command...")
			// exec.Command("reboot").Run() // Commented for safety in MVP
		case "start_rdp":
			log.Println("[AGENT] Starting Remote Desktop Session...")
			go func() {
				// Stop any existing session first
				if currentRDP != nil {
					currentRDP.Stop()
				}
				// Start new session
				// Assuming backend runs on localhost:8000 for development.
				// In production this would be the actual server IP.
				url := fmt.Sprintf("ws://localhost:8000/rdp/stream?agent_id=%s", agentID)
				currentRDP = NewRemoteDesktopSession(url, agentID)
				currentRDP.Start()
			}()
		case "stop_rdp":
			log.Println("[AGENT] Stopping Remote Desktop Session...")
			if currentRDP != nil {
				currentRDP.Stop()
				currentRDP = nil
			}
		case "shell_connect":
			log.Println("[AGENT] Spawning reverse shell session...")
			// For MVP, we just start it locally to test logic.
			// In real world, we would dial a WebSocket to the bridge.
			session, err := StartTerminal(80, 24)
			if err != nil {
				log.Printf("[AGENT] Failed to start terminal: %v", err)
				return
			}
			defer session.Close()

			// Just echo to log for now to prove it works without a real WS tunnel yet
			go func() {
				buf := make([]byte, 1024)
				for {
					n, err := session.Output.Read(buf)
					if err != nil {
						break
					}
					log.Printf("[TERM OUTPUT] %s", string(buf[:n]))
				}
			}()

			log.Println("[AGENT] Terminal started. Output piped to log.")
		}
	})

	// 5. Setup Signal Handling
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)

	// 6. Main Ticker Loop
	go func() {
		ticker := time.NewTicker(5 * time.Second)
		defer ticker.Stop()
		for {
			select {
			case <-ticker.C:
				// Collect
				metrics, err := collector.GetMetrics()
				if err != nil {
					log.Printf("[AGENT] Error collecting metrics: %v", err)
					continue
				}

				// Cache
				if err := cache.SaveTelemetry(metrics); err != nil {
					log.Printf("[AGENT] Error caching telemetry: %v", err)
				}

				// Drain Cache
				drainCache(cache, client)
			}
		}
	}()

	// Block until signal
	<-sigChan
	fmt.Println("[AGENT] Shutdown signal received.")
}

func getAgentID() string {
	// For MVP: try reading from a local file, otherwise generate
	idFile := ".agent_id"
	data, err := os.ReadFile(idFile)
	if err == nil {
		return string(data)
	}
	id := uuid.New().String()
	_ = os.WriteFile(idFile, []byte(id), 0644)
	return id
}

func drainCache(cache *LocalCache, client *PulseClient) {
	// Fetch pending records
	metricsBatch, ids, err := cache.GetPending(50)
	if err != nil {
		return
	}
	if len(ids) == 0 {
		return
	}

	successIds := []int64{}
	for i, m := range metricsBatch {
		if err := client.PublishTelemetry(m); err == nil {
			successIds = append(successIds, ids[i])
		} else {
			// If we fail to publish one, stop draining for now
			break
		}
	}

	// Remove successfully sent records from local cache
	if len(successIds) > 0 {
		_ = cache.DeleteTelemetry(successIds)
	}
}
