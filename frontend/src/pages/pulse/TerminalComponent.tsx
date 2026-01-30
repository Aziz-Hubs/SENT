import React, { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";

interface TerminalComponentProps {
  deviceId: string;
}

const TerminalComponent: React.FC<TerminalComponentProps> = ({ deviceId }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize xterm.js
    const term = new Terminal({
      cursorBlink: true,
      theme: {
        background: "#09090b", // zinc-950
        foreground: "#f1f5f9", // slate-100
        cursor: "#22c55e", // green-500
      },
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      fontSize: 12,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(terminalRef.current);
    fitAddon.fit();
    xtermRef.current = term;

    // Connect WebSocket
    // Note: Hardcoded localhost for MVP dev
    const ws = new WebSocket(
      `ws://localhost:8000/api/pulse/terminal/${deviceId}`,
    );
    wsRef.current = ws;

    term.writeln("\x1b[33mConnecting to secure remote shell...\x1b[0m");

    ws.onopen = () => {
      term.writeln("\x1b[32m[CONNECTED]\x1b[0m");
      term.write("\r\nroot@remote:~# ");
    };

    ws.onmessage = (event) => {
      term.write(event.data);
    };

    ws.onerror = (error) => {
      term.writeln(`\r\n\x1b[31mConnection error\x1b[0m`);
      console.error("WS Error", error);
    };

    ws.onclose = () => {
      term.writeln("\r\n\x1b[31m[DISCONNECTED]\x1b[0m");
    };

    // Handle Input
    term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
    });
    resizeObserver.observe(terminalRef.current);

    return () => {
      ws.close();
      term.dispose();
      resizeObserver.disconnect();
    };
  }, [deviceId]);

  return (
    <div
      ref={terminalRef}
      className="w-full h-full min-h-[400px] bg-zinc-950 rounded-md overflow-hidden p-2"
    />
  );
};

export default TerminalComponent;
