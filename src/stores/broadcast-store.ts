// Zustand store for broadcast state
import { create } from "zustand";
import type { Broadcast, LiveStream } from "@/types";

interface BroadcastState {
    // Current active broadcast
    broadcast: Broadcast | null;
    setBroadcast: (broadcast: Broadcast | null) => void;

    // Current active livestream
    liveStream: LiveStream | null;
    setLiveStream: (liveStream: LiveStream | null) => void;

    // Clear all (after stream ends)
    reset: () => void;
}

export const useBroadcastStore = create<BroadcastState>((set) => ({
    broadcast: null,
    setBroadcast: (broadcast) => set({ broadcast }),

    liveStream: null,
    setLiveStream: (liveStream) => set({ liveStream }),

    reset: () => set({ broadcast: null, liveStream: null }),
}));
