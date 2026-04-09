// Type definitions matching Go backend models

// ─── User ───────────────────────────────────────────────
export interface User {
    id: string;
    clerkUserId: string;
    email: string;
    displayName: string;
    profileImageUrl: string;
    youtubeConnected: boolean;
    createdAt: string;
    updatedAt: string;
}

// ─── YouTube ────────────────────────────────────────────
export interface YouTubeChannelInfo {
    channelId: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    subscriberCount: string;
    videoCount: string;
}

export interface YouTubeConnectionStatus {
    connected: boolean;
    channelId?: string;
    channelTitle?: string;
}

// ─── Broadcast ──────────────────────────────────────────
export interface Broadcast {
    id: string;
    title: string;
    description: string;
    channelId: string;
    status: BroadcastStatus;
    scheduledStartTime: string;
    liveChatId: string;
    liveStreamId: string;
    privacyStatus: string;
    createdAt: string;
    updatedAt: string;
}

export type BroadcastStatus =
    | "created"
    | "ready"
    | "testStarting"
    | "testing"
    | "liveStarting"
    | "live"
    | "complete"
    | "revoked"
    | "expired";

export interface BroadcastStats {
    concurrentViewers: string;
    totalChatMessages: string;
}

// ─── LiveStream ─────────────────────────────────────────
export interface LiveStream {
    id: string;
    youtubeId: string;
    title: string;
    ingestionAddress: string;
    streamName: string;
    status: string;
    createdBy: string;
    createdAt: string;
}

// ─── Overlay ────────────────────────────────────────────
export interface Overlay {
    id: string;
    userId: string;
    publicId: string;
    url: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

// ─── Live Chat ──────────────────────────────────────────
export interface ChatMessage {
    id: string;
    authorChannelId: string;
    channelName: string;
    profileImage: string;
    messageContent: string;
    liveChatId: string;
}

export interface BlockedUser {
    id: string;
    channelId: string;
    channelName: string;
    profileImage: string;
    messageContent: string;
    banId: string;
}

// ─── Moderation ─────────────────────────────────────────
export interface ModerationResult {
    classification: "SPAM" | "NOT_SPAM";
    confidence: number;
    actionTaken: "NONE" | "WARNING" | "TEMP_BAN" | "PERM_BAN";
}

export interface ModerationLog {
    id: string;
    userId: string;
    username: string;
    broadcastId: string;
    messageContent: string;
    spamClassification: string;
    spamConfidence: number;
    llmReason: string;
    actionTaken: string;
    createdAt: string;
}

export interface UserStrike {
    id: string;
    userId: string;
    username: string;
    strikeCount: number;
    lastViolationAt: string;
    banStatus: string;
    banId: string;
    banExpiresAt: string;
}

// ─── Streaming (WebSocket) ──────────────────────────────
export interface StreamStartMessage {
    type: "start";
    broadcastId: string;
    overlayUrl?: string;
}

export interface StreamControlMessage {
    type: "switch-overlay" | "stop";
    overlayUrl?: string;
}

export interface StreamStatusMessage {
    type: "connected" | "streaming" | "error" | "stopped";
    sessionId?: string;
    message?: string;
}

// ─── API Response Wrappers ──────────────────────────────
export interface ApiResponse<T> {
    status: string;
    message?: string;
    data: T;
}

export interface PaginatedResponse<T> {
    status: string;
    data: {
        items: T[];
        limit: number;
        offset: number;
        count: number;
    };
}
