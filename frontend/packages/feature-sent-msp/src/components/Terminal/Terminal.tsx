import React, { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

interface TerminalComponentProps {
    sessionId?: string;
}

const Terminal: React.FC<TerminalComponentProps> = ({ sessionId = "test-session-" + Date.now() }) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const xtermRef = useRef<XTerm | null>(null);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!terminalRef.current) return;

        // Initialize xterm
        const term = new XTerm({
            cursorBlink: true,
            theme: {
                background: '#1e1e1e',
                foreground: '#ffffff',
            },
            fontFamily: 'Consolas, monospace',
            fontSize: 14,
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);

        term.open(terminalRef.current);
        fitAddon.fit();

        xtermRef.current = term;

        // Connect to WebSocket
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";
        const wsUrl = apiUrl.replace(/^http/, 'ws') + `/api/v1/ws/terminal?session_id=${sessionId}`;

        term.writeln(`Connecting to ${wsUrl}...`);

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.binaryType = "arraybuffer";

        ws.onopen = () => {
            term.writeln("\r\nConnected to Agent.\r\n");
            // Optional: Send initial resize or ping
            ws.send(new TextEncoder().encode(""));
        };

        ws.onmessage = (event) => {
            let text = "";
            if (typeof event.data === "string") {
                text = event.data;
            } else {
                text = new TextDecoder().decode(event.data);
            }
            term.write(text);
        };

        ws.onerror = (err) => {
            console.error("WS Error", err);
            term.writeln("\r\nWebSocket Error\r\n");
        };

        ws.onclose = () => {
            term.writeln("\r\nConnection Closed\r\n");
        };

        // Handle Resize
        term.onResize((size: { cols: number; rows: number }) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: "resize",
                    cols: size.cols,
                    rows: size.rows,
                }));
            }
        });

        // Handle Outgoing Data
        term.onData((data: string) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(new TextEncoder().encode(data));
            }
        });

        // Cleanup
        return () => {
            if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                ws.close();
            }
            term.dispose();
        };
    }, [sessionId]);

    return (
        <div
            ref={terminalRef}
            style={{
                width: '100%',
                height: '400px',
                backgroundColor: '#1e1e1e',
                padding: '10px'
            }}
        />
    );
};

export default Terminal;
