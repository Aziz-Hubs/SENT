package bridge

import (
    "log"
    "net/http"
    "sync"
    "github.com/gorilla/websocket"
)



// Map agentID -> *websocket.Conn (Agent Connection)
// Map agentID -> *websocket.Conn (Viewer Connection)
// For MVP, we use a simple in-memory session map.

type RDPSession struct {
    AgentConn  *websocket.Conn
    ViewerConn *websocket.Conn
    AgentID    string
    Mutex      sync.Mutex
}

var rdpSessions = make(map[string]*RDPSession)
var rdpSessionsMutex sync.RWMutex

func (b *PulseBridge) HandleRDPStream(w http.ResponseWriter, r *http.Request) {
    agentID := r.URL.Query().Get("agent_id")
    if agentID == "" {
        http.Error(w, "Missing agent_id", 400)
        return
    }

    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        log.Printf("[BRIDGE] RDP Stream Upgrade failed: %v", err)
        return
    }
    defer conn.Close()

    session := getOrCreateRDPSession(agentID)
    session.Mutex.Lock()
    if session.AgentConn != nil {
        session.AgentConn.Close()
    }
    session.AgentConn = conn
    session.Mutex.Unlock()

    log.Printf("[BRIDGE] Agent %s connected for RDP", agentID)
    
    // Relay loop: Agent -> Viewer
    // Messages from Agent are Screen Frames (Binary)
    for {
        msgType, msg, err := conn.ReadMessage()
        if err != nil {
            break
        }
        
        session.Mutex.Lock()
        viewer := session.ViewerConn
        session.Mutex.Unlock()

        if viewer != nil {
            // Forward frame to viewer
            if err := viewer.WriteMessage(msgType, msg); err != nil {
                // If viewer is disconnected, we just ignore for now or close it
            }
        }
    }
    
    session.Mutex.Lock()
    session.AgentConn = nil
    session.Mutex.Unlock()
}

func (b *PulseBridge) HandleRDPView(w http.ResponseWriter, r *http.Request) {
    agentID := r.URL.Query().Get("agent_id")
    if agentID == "" {
        http.Error(w, "Missing agent_id", 400)
        return
    }

    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        return
    }
    defer conn.Close()

    session := getOrCreateRDPSession(agentID)
    session.Mutex.Lock()
    if session.ViewerConn != nil {
        session.ViewerConn.Close()
    }
    session.ViewerConn = conn
    session.Mutex.Unlock()

    log.Printf("[BRIDGE] Viewer connected for Agent %s", agentID)

    // Relay loop: Viewer -> Agent
    // Messages from Viewer are Input Events (JSON)
    for {
        msgType, msg, err := conn.ReadMessage()
        if err != nil {
            break
        }

        session.Mutex.Lock()
        agent := session.AgentConn
        session.Mutex.Unlock()

        if agent != nil {
            // Forward input to agent
            if err := agent.WriteMessage(msgType, msg); err != nil {
                // Handle error
            }
        }
    }

    session.Mutex.Lock()
    session.ViewerConn = nil
    session.Mutex.Unlock()
}

func getOrCreateRDPSession(agentID string) *RDPSession {
    rdpSessionsMutex.Lock()
    defer rdpSessionsMutex.Unlock()
    
    if s, ok := rdpSessions[agentID]; ok {
        return s
    }
    
    s := &RDPSession{AgentID: agentID}
    rdpSessions[agentID] = s
    return s
}
