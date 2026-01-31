import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Square, Loader2, MousePointer2 } from "lucide-react";

interface RemoteDesktopProps {
  deviceId: string;
}

const RemoteDesktopComponent: React.FC<RemoteDesktopProps> = ({ deviceId }) => {
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const startSession = async () => {
    setLoading(true);
    try {
      // Send command via Wails to Bridge -> Manager -> Agent
      // @ts-ignore
      await window.go.bridge.PulseBridge.SendCommand(deviceId, "start_rdp");

      // Give agent a moment to start the stream
      setTimeout(() => {
        connectWebSocket();
      }, 1000);
    } catch (e) {
      console.error("Failed to start RDP:", e);
      setLoading(false);
    }
  };

  const connectWebSocket = () => {
    // Connect to Bridge View Endpoint
    // Assuming backend runs on port 8000 (standard for this project's bridge)
    const ws = new WebSocket(
      `ws://localhost:8000/rdp/view?agent_id=${deviceId}`,
    );
    ws.binaryType = "arraybuffer";

    ws.onopen = () => {
      console.log("RDP Connected");
      setActive(true);
      setLoading(false);
    };

    ws.onerror = (e) => {
      console.log("RDP Error", e);
      setLoading(false);
    };

    ws.onmessage = async (event) => {
      if (event.data instanceof ArrayBuffer) {
        const blob = new Blob([event.data], { type: "image/jpeg" });
        try {
          const bitmap = await createImageBitmap(blob);
          const canvas = canvasRef.current;
          if (canvas) {
            // Only resize if dimensions change to avoid flicker
            if (canvas.width !== bitmap.width) canvas.width = bitmap.width;
            if (canvas.height !== bitmap.height) canvas.height = bitmap.height;

            const ctx = canvas.getContext("2d");
            ctx?.drawImage(bitmap, 0, 0);
          }
        } catch (e) {
          // Frame error
        }
      }
    };

    ws.onclose = () => {
      setActive(false);
      setLoading(false);
    };

    wsRef.current = ws;
  };

  const stopSession = async () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    // @ts-ignore
    await window.go.bridge.PulseBridge.SendCommand(deviceId, "stop_rdp");
    setActive(false);
  };

  // Input Handling
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!active || !wsRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    // Calculate scaling if canvas is resized by CSS
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);

    sendInput({ type: "mousemove", x, y });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    sendInput({ type: "mousedown", button: e.button === 0 ? "left" : "right" });
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    sendInput({ type: "mouseup", button: e.button === 0 ? "left" : "right" });
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!active) return;
    sendInput({ type: "keydown", key: e.key.toLowerCase() });
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    if (!active) return;
    sendInput({ type: "keyup", key: e.key.toLowerCase() });
  };

  const sendInput = (event: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(event));
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [active]);

  return (
    <div className="flex flex-col h-full bg-black rounded-lg overflow-hidden border border-zinc-800 shadow-2xl">
      {/* Toolbar */}
      <div className="h-12 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur flex items-center px-4 gap-4">
        {!active && !loading && (
          <Button
            size="sm"
            onClick={startSession}
            className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20 shadow-lg transition-all"
          >
            <Play className="w-4 h-4 mr-2 fill-current" /> Start Remote Control
          </Button>
        )}

        {loading && (
          <Button size="sm" disabled className="bg-zinc-800 text-zinc-400">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Connecting...
          </Button>
        )}

        {active && (
          <Button
            size="sm"
            variant="destructive"
            onClick={stopSession}
            className="animate-in fade-in zoom-in"
          >
            <Square className="w-4 h-4 mr-2 fill-current" /> End Session
          </Button>
        )}

        <div className="h-4 w-px bg-zinc-700 mx-2" />

        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <MousePointer2 className="w-3 h-3" />
          <span>Interactive Mode</span>
        </div>

        <div className="ml-auto text-xs font-mono text-zinc-500">
          {active ? "LIVE ● 5 FPS" : "OFFLINE"}
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 bg-zinc-950 flex items-center justify-center overflow-hidden relative group">
        {!active && !loading && (
          <div className="text-zinc-600 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center ring-1 ring-zinc-800">
              <MousePointer2 className="w-8 h-8 opacity-50" />
            </div>
            <p>Start session to view remote screen</p>
          </div>
        )}

        <canvas
          ref={canvasRef}
          className={`max-w-full max-h-full object-contain ${active ? "cursor-none pointer-events-auto" : "pointer-events-none"}`}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onContextMenu={(e) => e.preventDefault()}
        />

        {/* Custom cursor overlay if needed, or just let OS handle it via remote events */}
      </div>
    </div>
  );
};

export default RemoteDesktopComponent;
