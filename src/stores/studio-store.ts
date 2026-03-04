// Zustand store for studio/streaming session state
import { create } from "zustand";

export type StreamStatus = "idle" | "connecting" | "streaming" | "error" | "stopped";

interface StudioState {
    // Stream status
    streamStatus: StreamStatus;
    setStreamStatus: (status: StreamStatus) => void;

    // Overlay
    overlayUrl: string | null;
    setOverlayUrl: (url: string | null) => void;

    // WebSocket readiness
    isConnected: boolean;
    setIsConnected: (connected: boolean) => void;

    // Error message
    errorMessage: string | null;
    setErrorMessage: (message: string | null) => void;

    // Reset
    reset: () => void;
}

export const useStudioStore = create<StudioState>((set) => ({
    streamStatus: "idle",
    setStreamStatus: (streamStatus) => set({ streamStatus }),

    overlayUrl: null,
    setOverlayUrl: (overlayUrl) => set({ overlayUrl }),

    isConnected: false,
    setIsConnected: (isConnected) => set({ isConnected }),

    errorMessage: null,
    setErrorMessage: (errorMessage) => set({ errorMessage }),

    reset: () =>
        set({
            streamStatus: "idle",
            overlayUrl: null,
            isConnected: false,
            errorMessage: null,
        }),
}));
