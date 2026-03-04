// WebSocket hook for FFmpeg stream relay
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import type { StreamStatusMessage, StreamStartMessage, StreamControlMessage } from "@/types";
import { useStudioStore } from "@/stores";

const API_BASE = process.env.NEXT_PUBLIC_GO_BACKEND_URL || "http://localhost:8080";
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 3000;

export function useStreamWebSocket() {
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectAttempts = useRef(0);
    const { getToken } = useAuth();
    const [lastMessage, setLastMessage] = useState<StreamStatusMessage | null>(null);

    const {
        setStreamStatus,
        setIsConnected,
        setErrorMessage,
    } = useStudioStore();

    // Connect to the stream WebSocket
    const connect = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) {
                setErrorMessage("Authentication required. Please sign in.");
                setStreamStatus("error");
                return;
            }

            const wsProtocol = API_BASE.startsWith("https") ? "wss" : "ws";
            const wsBase = API_BASE.replace(/^https?/, wsProtocol);
            const wsURL = `${wsBase}/ws/stream?token=${encodeURIComponent(token)}`;

            const ws = new WebSocket(wsURL);

            ws.onopen = () => {
                console.log("[StreamWS] Connected");
                reconnectAttempts.current = 0;
                setIsConnected(true);
                setErrorMessage(null);
            };

            ws.onmessage = (event) => {
                try {
                    const msg: StreamStatusMessage = JSON.parse(event.data);
                    setLastMessage(msg);

                    switch (msg.type) {
                        case "connected":
                            setStreamStatus("idle");
                            break;
                        case "streaming":
                            setStreamStatus("streaming");
                            break;
                        case "error":
                            setStreamStatus("error");
                            setErrorMessage(msg.message || "Stream error");
                            break;
                        case "stopped":
                            setStreamStatus("stopped");
                            break;
                    }
                } catch {
                    // Non-JSON message, ignore
                }
            };

            ws.onerror = () => {
                console.error("[StreamWS] Error");
                reconnectAttempts.current++;

                if (reconnectAttempts.current <= MAX_RECONNECT_ATTEMPTS) {
                    setTimeout(() => connect(), RECONNECT_DELAY);
                } else {
                    setStreamStatus("error");
                    setErrorMessage(
                        `Failed to connect after ${MAX_RECONNECT_ATTEMPTS} attempts`
                    );
                }
            };

            ws.onclose = () => {
                console.log("[StreamWS] Disconnected");
                setIsConnected(false);

                if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
                    setTimeout(() => connect(), RECONNECT_DELAY);
                }
            };

            wsRef.current = ws;
        } catch (error) {
            console.error("[StreamWS] Init error:", error);
            setStreamStatus("error");
            setErrorMessage("Failed to initialize WebSocket");
        }
    }, [getToken, setStreamStatus, setIsConnected, setErrorMessage]);

    // Start streaming
    const startStream = useCallback(
        (broadcastId: string, overlayUrl?: string) => {
            if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

            const msg: StreamStartMessage = {
                type: "start",
                broadcastId,
                ...(overlayUrl ? { overlayUrl } : {}),
            };

            wsRef.current.send(JSON.stringify(msg));
            setStreamStatus("connecting");
        },
        [setStreamStatus]
    );

    // Send binary data (WebM chunks)
    const sendBinaryData = useCallback((data: Blob) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(data);
        }
    }, []);

    // Switch overlay
    const switchOverlay = useCallback((overlayUrl: string) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

        const msg: StreamControlMessage = {
            type: "switch-overlay",
            overlayUrl,
        };

        wsRef.current.send(JSON.stringify(msg));
    }, []);

    // Stop streaming
    const stopStream = useCallback(() => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

        wsRef.current.send(JSON.stringify({ type: "stop" }));
        setStreamStatus("stopped");
    }, [setStreamStatus]);

    // Disconnect WebSocket
    const disconnect = useCallback(() => {
        if (wsRef.current) {
            if (wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ type: "stop" }));
            }
            wsRef.current.close();
            wsRef.current = null;
        }
        setIsConnected(false);
        setStreamStatus("idle");
    }, [setIsConnected, setStreamStatus]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            disconnect();
        };
    }, [disconnect]);

    return {
        wsRef,
        connect,
        disconnect,
        startStream,
        sendBinaryData,
        switchOverlay,
        stopStream,
        lastMessage,
    };
}
