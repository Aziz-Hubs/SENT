package bridge

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

// HandleTerminalConnect handles WebSocket connections for remote terminal sessions
func (b *PulseBridge) HandleTerminalConnect(w http.ResponseWriter, r *http.Request) {
    // In a real implementation:
    // 1. Authenticate Request
    // 2. Locate Agent (is it connected?)
    // 3. Broker Connection (Bridge <-> Agent Tunnel)
    
    // For MVP Phase 1 (Local Demo), we will simulate the echo shell here
    // or if the agent was running on the same machine we could try to pipe it.
    
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("[BRIDGE] Failed to upgrade WS: %v", err)
		return
	}
	defer conn.Close()

	log.Println("[BRIDGE] Terminal WS Connected")

    // Simple Echo Loop for MVP Verification of Frontend
	for {
		mt, message, err := conn.ReadMessage()
		if err != nil {
			log.Println("[BRIDGE] read:", err)
			break
		}
		
		// Echo back with a prefix to show it went through backend
		response := append([]byte("Echo: "), message...)
		err = conn.WriteMessage(mt, response)
		if err != nil {
			log.Println("[BRIDGE] write:", err)
			break
		}
	}
}
