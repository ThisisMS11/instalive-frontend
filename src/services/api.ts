// TanStack Query hooks for YouTube API — wraps api-client
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { apiClient } from "@/lib/api-client";
import type {
    ApiResponse,
    Broadcast,
    LiveStream,
    Overlay,
    ChatMessage,
    BlockedUser,
    BroadcastStats,
    YouTubeChannelInfo,
    YouTubeConnectionStatus,
} from "@/types";

// ─── Token Helper ───────────────────────────────────────
function useAuthToken() {
    const { getToken } = useAuth();
    return getToken;
}

// ─── Auth ───────────────────────────────────────────────
export function useCurrentUser() {
    const getToken = useAuthToken();
    return useQuery({
        queryKey: ["auth", "me"],
        queryFn: async () => {
            const token = await getToken();
            return apiClient.get<ApiResponse<unknown>>("/api/v1/auth/me", token);
        },
    });
}

// ─── YouTube Connection ─────────────────────────────────
// NOTE: /youtube/status returns flat JSON { connected, channel_id, ... }
// (the OAuth handler uses gin.H{} directly, NOT response.Success)
export function useYouTubeStatus() {
    const getToken = useAuthToken();
    return useQuery({
        queryKey: ["youtube", "status"],
        queryFn: async () => {
            const token = await getToken();
            return apiClient.get<YouTubeConnectionStatus>(
                "/api/v1/youtube/status",
                token
            );
        },
    });
}

// NOTE: /youtube/info returns { success, message, data: <raw YouTube Channel object> }
// The raw channel object has nested snippet/statistics, not our flat type
export interface YouTubeChannelRaw {
    id: string;
    snippet: {
        title: string;
        description: string;
        customUrl?: string;
        thumbnails: {
            default?: { url: string };
            medium?: { url: string };
            high?: { url: string };
        };
    };
    statistics: {
        subscriberCount: string;
        videoCount: string;
        viewCount: string;
    };
}

export function useYouTubeInfo() {
    const getToken = useAuthToken();
    return useQuery({
        queryKey: ["youtube", "info"],
        queryFn: async () => {
            const token = await getToken();
            return apiClient.get<{ success: boolean; message: string; data: YouTubeChannelRaw }>(
                "/api/v1/youtube/info",
                token
            );
        },
    });
}

export function useInitiateYouTubeOAuth() {
    const getToken = useAuthToken();

    return useMutation({
        mutationFn: async () => {
            const token = await getToken();
            return apiClient.get<{ auth_url: string }>(
                "/api/v1/youtube/oauth/init",
                token
            );
        },
    });
}

export function useDisconnectYouTube() {
    const getToken = useAuthToken();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const token = await getToken();
            return apiClient.delete<ApiResponse<unknown>>(
                "/api/v1/youtube/disconnect",
                token
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["youtube"] });
        },
    });
}

// ─── Broadcasts ─────────────────────────────────────────
export function useBroadcasts() {
    const getToken = useAuthToken();
    return useQuery({
        queryKey: ["broadcasts"],
        queryFn: async () => {
            const token = await getToken();
            return apiClient.get<ApiResponse<Broadcast[]>>(
                "/api/v1/youtube/broadcast",
                token
            );
        },
    });
}

export function useCreateBroadcast() {
    const getToken = useAuthToken();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            title: string;
            description: string;
            scheduledStartTime: string;
            privacy: string;
            madeForKids?: boolean;
        }) => {
            const token = await getToken();
            return apiClient.post<ApiResponse<Broadcast>>(
                "/api/v1/youtube/broadcast",
                data,
                token
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["broadcasts"] });
        },
    });
}

export function useBroadcastStatus(broadcastId: string | undefined) {
    const getToken = useAuthToken();
    return useQuery({
        queryKey: ["broadcast", "status", broadcastId],
        queryFn: async () => {
            const token = await getToken();
            return apiClient.get<ApiResponse<{ status: string }>>(
                `/api/v1/youtube/broadcast/status?broadcastId=${broadcastId}`,
                token
            );
        },
        enabled: !!broadcastId,
        refetchInterval: 5000, // Poll every 5s
    });
}

export function useUpdateBroadcastStatus() {
    const getToken = useAuthToken();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { broadcastId: string; status: string }) => {
            const token = await getToken();
            return apiClient.put<ApiResponse<unknown>>(
                "/api/v1/youtube/broadcast/status",
                { youtubeBroadcastId: data.broadcastId, status: data.status },
                token
            );
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["broadcast", "status", variables.broadcastId],
            });
            queryClient.invalidateQueries({
                queryKey: ["broadcasts"],
            });
        },
    });
}

export function useBroadcastStats(broadcastId: string | undefined) {
    const getToken = useAuthToken();
    return useQuery({
        queryKey: ["broadcast", "stats", broadcastId],
        queryFn: async () => {
            const token = await getToken();
            return apiClient.get<ApiResponse<BroadcastStats>>(
                `/api/v1/youtube/broadcast/stats?broadcastId=${broadcastId}&type=metrics`,
                token
            );
        },
        enabled: !!broadcastId,
        refetchInterval: 10000, // Poll every 10s
    });
}

// ─── LiveStream ─────────────────────────────────────────
export function useLiveStreams() {
    const getToken = useAuthToken();
    return useQuery({
        queryKey: ["livestreams"],
        queryFn: async () => {
            const token = await getToken();
            return apiClient.get<ApiResponse<LiveStream[]>>(
                "/api/v1/youtube/livestream",
                token
            );
        },
    });
}

// ─── Overlays ───────────────────────────────────────────
export function useOverlays() {
    const getToken = useAuthToken();
    return useQuery({
        queryKey: ["overlays"],
        queryFn: async () => {
            const token = await getToken();
            return apiClient.get<ApiResponse<Overlay[]>>(
                "/api/v1/youtube/broadcast/overlay",
                token
            );
        },
    });
}

export function useUploadOverlay() {
    const getToken = useAuthToken();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (formData: FormData) => {
            const token = await getToken();
            return apiClient.upload<ApiResponse<Overlay>>(
                "/api/v1/youtube/broadcast/overlay",
                formData,
                token
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["overlays"] });
        },
    });
}

export function useDeleteOverlay() {
    const getToken = useAuthToken();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const token = await getToken();
            return apiClient.delete<ApiResponse<null>>(
                `/api/v1/youtube/broadcast/overlay/${id}`,
                token
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["overlays"] });
        },
    });
}

// ─── Broadcast Settings ─────────────────────────────────
export interface BroadcastSettings {
    privacyStatus: string;
    madeForKids: boolean;
}

export function useBroadcastSettings(broadcastId: string | undefined) {
    const getToken = useAuthToken();
    return useQuery({
        queryKey: ["broadcast", "settings", broadcastId],
        queryFn: async () => {
            const token = await getToken();
            return apiClient.get<ApiResponse<BroadcastSettings>>(
                `/api/v1/youtube/broadcast/settings?broadcastId=${broadcastId}`,
                token
            );
        },
        enabled: !!broadcastId,
    });
}

export function useUpdateBroadcastSettings() {
    const getToken = useAuthToken();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: {
            broadcastId: string;
            privacyStatus?: string;
            madeForKids?: boolean;
        }) => {
            const token = await getToken();
            return apiClient.patch<ApiResponse<BroadcastSettings>>(
                "/api/v1/youtube/broadcast/settings",
                data,
                token
            );
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["broadcast", "settings", variables.broadcastId],
            });
            queryClient.invalidateQueries({ queryKey: ["broadcasts"] });
        },
    });
}

// ─── Live Chat ──────────────────────────────────────────
export function useChatMessages(liveChatId: string | undefined) {
    const getToken = useAuthToken();
    return useQuery({
        queryKey: ["livechat", liveChatId],
        queryFn: async () => {
            const token = await getToken();
            return apiClient.get<ApiResponse<ChatMessage[]>>(
                `/api/v1/youtube/livechat?liveChatId=${liveChatId}`,
                token
            );
        },
        enabled: !!liveChatId,
        refetchInterval: 3000, // Poll every 3s for new messages
    });
}

export function usePostChatMessage() {
    const getToken = useAuthToken();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { liveChatId: string; messageText: string }) => {
            const token = await getToken();
            return apiClient.post<ApiResponse<unknown>>(
                `/api/v1/youtube/livechat?liveChatId=${data.liveChatId}`,
                { message: data.messageText },
                token
            );
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["livechat", variables.liveChatId],
            });
        },
    });
}

// ─── Block User ─────────────────────────────────────────
export function useBlockedUsers() {
    const getToken = useAuthToken();
    return useQuery({
        queryKey: ["blockedUsers"],
        queryFn: async () => {
            const token = await getToken();
            return apiClient.get<ApiResponse<BlockedUser[]>>(
                "/api/v1/youtube/livechat/blocked",
                token
            );
        },
    });
}

export function useBlockUser() {
    const getToken = useAuthToken();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { liveChatId: string; channelId: string }) => {
            const token = await getToken();
            return apiClient.post<ApiResponse<unknown>>(
                "/api/v1/youtube/livechat/block",
                data,
                token
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["blockedUsers"] });
        },
    });
}

export function useUnblockUser() {
    const getToken = useAuthToken();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { banId: string }) => {
            const token = await getToken();
            return apiClient.put<ApiResponse<unknown>>(
                "/api/v1/youtube/livechat/block",
                data,
                token
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["blockedUsers"] });
        },
    });
}
