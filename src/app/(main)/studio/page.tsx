"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
    Radio,
    ArrowLeft,
    Loader2,
    Tv,
    CalendarDays,
    Play,
    Youtube,
    AlertCircle,
    Zap,
    CheckCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import {
    useBroadcasts,
    useBroadcastStatus,
    useUpdateBroadcastStatus,
    useYouTubeStatus,
    useInitiateYouTubeOAuth,
} from "@/services/api";
import { cn } from "@/lib/utils";
import StudioHeader from "@/components/studio/studio-header";
import LifecycleStepper from "@/components/studio/lifecycle-stepper";
import VideoPreview from "@/components/studio/video-preview";
import StreamControls from "@/components/studio/stream-controls";
import ChatPanel from "@/components/studio/chat-panel";
import OverlayPanel from "@/components/studio/overlay-panel";
import StatsBar from "@/components/studio/stats-bar";
import BlockedUsersPanel from "@/components/studio/blocked-users-panel";
import CreateBroadcastDialog from "@/components/dashboard/create-broadcast-dialog";
import { toast } from "sonner";
import type { Broadcast, BroadcastStatus } from "@/types";

// ─── Status badge helpers ────────────────────────────────
const statusColors: Record<string, string> = {
    created: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    ready: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
    testStarting: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    testing: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    liveStarting: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    live: "bg-red-500/20 text-red-400 border-red-500/30",
    complete: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

// ─── Lifecycle steps ─────────────────────────────────────
const lifecycleSteps = [
    { key: "ready", label: "Ready", statuses: ["created", "ready"] },
    { key: "testing", label: "Testing", statuses: ["testStarting", "testing"] },
    { key: "live", label: "Live", statuses: ["liveStarting", "live"] },
    { key: "complete", label: "Complete", statuses: ["complete"] },
];

function getStepIndex(status: string): number {
    const idx = lifecycleSteps.findIndex((s) => s.statuses.includes(status));
    return idx >= 0 ? idx : 0;
}

// ─── Broadcast Card ──────────────────────────────────────
function BroadcastCard({
    broadcast,
    index,
    onSelect,
}: {
    broadcast: Broadcast;
    index: number;
    onSelect: (broadcast: Broadcast) => void;
}) {
    const { data: statusData } = useBroadcastStatus(broadcast.id);
    const updateStatus = useUpdateBroadcastStatus();

    // The polled status from YouTube, fall back to DB status
    const liveStatus: string = (statusData?.data as unknown as string) ?? broadcast.status;
    const currentStep = getStepIndex(liveStatus);
    const isTransitioning = liveStatus === "testStarting" || liveStatus === "liveStarting";
    const canGoLive = liveStatus === "ready" || liveStatus === "testing" || liveStatus === "created";
    const isLive = liveStatus === "live";

    const handleGoLive = (e: React.MouseEvent) => {
        e.stopPropagation();
        updateStatus.mutate(
            { broadcastId: broadcast.id, status: "live" },
            {
                onSuccess: () => toast.success("Transitioning to live!"),
                onError: (err) => toast.error(`Failed: ${err.message}`),
            }
        );
    };

    return (
        <motion.div
            key={broadcast.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group w-full rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all overflow-hidden"
        >
            {/* Top row: title + status */}
            <button
                onClick={() => onSelect(broadcast)}
                className="w-full flex items-center gap-4 p-4 text-left"
            >
                <div className={cn(
                    "p-2.5 rounded-lg transition-colors",
                    isLive
                        ? "bg-gradient-to-br from-red-500/25 to-rose-500/25"
                        : "bg-gradient-to-br from-violet-500/20 to-indigo-500/20 group-hover:from-violet-500/30 group-hover:to-indigo-500/30"
                )}>
                    {isLive ? (
                        <Radio className="w-4 h-4 text-red-400 animate-pulse" />
                    ) : (
                        <Play className="w-4 h-4 text-violet-400" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-white transition-colors">
                        {broadcast.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                        <CalendarDays className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">
                            {broadcast.createdAt
                                ? new Date(broadcast.createdAt).toLocaleDateString()
                                : "N/A"}
                        </span>
                    </div>
                </div>
                <Badge
                    variant="outline"
                    className={`text-[10px] shrink-0 ${statusColors[liveStatus] || statusColors.ready}`}
                >
                    {isTransitioning && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
                    {liveStatus}
                </Badge>
            </button>

            {/* Progress bar */}
            <div className="px-4 pb-3">
                <div className="flex items-center gap-1">
                    {lifecycleSteps.map((step, i) => {
                        const reached = i <= currentStep;
                        const isCurrent = i === currentStep;
                        return (
                            <div key={step.key} className="flex-1 flex flex-col items-center gap-1">
                                <div className="w-full flex items-center">
                                    <div
                                        className={cn(
                                            "h-1 w-full rounded-full transition-all duration-500",
                                            reached
                                                ? isCurrent && step.key === "live"
                                                    ? "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]"
                                                    : reached
                                                        ? "bg-violet-500"
                                                        : "bg-white/[0.06]"
                                                : "bg-white/[0.06]"
                                        )}
                                    />
                                </div>
                                <span
                                    className={cn(
                                        "text-[9px] font-medium transition-colors",
                                        isCurrent
                                            ? step.key === "live"
                                                ? "text-red-400"
                                                : "text-violet-400"
                                            : reached
                                                ? "text-muted-foreground"
                                                : "text-muted-foreground/40"
                                    )}
                                >
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Go Live button */}
            {canGoLive && (
                <div className="px-4 pb-4">
                    <Button
                        size="sm"
                        onClick={handleGoLive}
                        disabled={updateStatus.isPending}
                        className="w-full gap-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white border-0 shadow-lg shadow-red-500/20"
                    >
                        {updateStatus.isPending ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <Zap className="w-3.5 h-3.5" />
                        )}
                        Go Live
                    </Button>
                </div>
            )}
        </motion.div>
    );
}

// ─── Broadcast Selector ──────────────────────────────────
function BroadcastSelector({
    onSelect,
}: {
    onSelect: (broadcast: Broadcast) => void;
}) {
    const { data: broadcastsData, isLoading } = useBroadcasts();
    const { data: statusData, isLoading: statusLoading } = useYouTubeStatus();
    const initiateOAuth = useInitiateYouTubeOAuth();
    const broadcasts = broadcastsData?.data ?? [];
    const isConnected = statusData?.connected;

    const readyBroadcasts = broadcasts.filter(
        (b) => b.status === "ready" || b.status === "created" || b.status === "testing" || b.status === "live"
    );

    const handleConnect = () => {
        initiateOAuth.mutate(undefined, {
            onSuccess: (data) => {
                window.location.href = data.auth_url;
            },
            onError: (error) => {
                toast.error(`Failed to start YouTube connection: ${error.message}`);
            },
        });
    };

    // Show loading while checking YouTube connection status
    if (statusLoading) {
        return (
            <main className="min-h-screen flex items-center justify-center p-6">
                <div className="flex items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Checking YouTube connection...</span>
                </div>
            </main>
        );
    }

    // Show connect card when YouTube channel is not connected
    if (!isConnected) {
        return (
            <main className="min-h-screen flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="glass rounded-3xl p-8 max-w-lg w-full relative overflow-hidden"
                >
                    {/* Ambient glow */}
                    <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-red-500/15 to-rose-500/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-pink-500/10 to-rose-500/5 rounded-full blur-3xl" />

                    <div className="relative z-10">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-6">
                            <Link href="/dashboard">
                                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/[0.06]">
                                    <ArrowLeft className="w-4 h-4" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold">Enter Studio</h1>
                                <p className="text-xs text-muted-foreground">Connect your YouTube channel first</p>
                            </div>
                        </div>

                        {/* Connect YouTube Card */}
                        <div className="text-center py-8">
                            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-rose-500/20 flex items-center justify-center mb-5">
                                <Youtube className="w-8 h-8 text-red-400" />
                            </div>
                            <h2 className="text-lg font-semibold mb-2">YouTube Channel Required</h2>
                            <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-2">
                                Connect your YouTube channel to create broadcasts and start streaming.
                            </p>
                            <div className="flex items-center justify-center gap-1.5 text-xs text-amber-400 mb-6">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>No channel connected</span>
                            </div>
                            <Button
                                variant="outline"
                                onClick={handleConnect}
                                disabled={initiateOAuth.isPending}
                                className="w-full max-w-xs border-white/[0.08] hover:bg-white/[0.04] gap-2"
                            >
                                {initiateOAuth.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Youtube className="w-4 h-4" />
                                )}
                                Connect YouTube Account
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="glass rounded-3xl p-8 max-w-lg w-full relative overflow-hidden"
            >
                {/* Ambient glow */}
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-violet-500/15 to-indigo-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-pink-500/10 to-rose-500/5 rounded-full blur-3xl" />

                <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/[0.06]">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold">Enter Studio</h1>
                            <p className="text-xs text-muted-foreground">Select a broadcast to go live</p>
                        </div>
                    </div>

                    {/* Create new */}
                    {readyBroadcasts.length === 0 && (
                        <div className="mb-6">
                            <CreateBroadcastDialog />
                        </div>
                    )}

                    {/* Broadcast list */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : readyBroadcasts.length === 0 ? (
                        <div className="text-center py-12">
                            <Tv className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
                            <p className="text-sm text-muted-foreground">No broadcasts ready</p>
                            <p className="text-xs text-muted-foreground/60 mt-1">
                                Create a new broadcast to get started
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">
                                Available Broadcasts
                            </p>
                            {readyBroadcasts.map((broadcast, i) => (
                                <BroadcastCard
                                    key={broadcast.id}
                                    broadcast={broadcast}
                                    index={i}
                                    onSelect={onSelect}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </main>
    );
}

// ─── Studio View (main streaming interface) ──────────────
function StudioView({ broadcast }: { broadcast: Broadcast }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const [isStopping, setIsStopping] = useState(false);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isAudioOn, setIsAudioOn] = useState(true);
    const [overlayUrl, setOverlayUrl] = useState<string | undefined>();
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

    const { getToken } = useAuth();
    const { data: statusData } = useBroadcastStatus(broadcast.id);
    const updateStatus = useUpdateBroadcastStatus();
    const currentStatus = (statusData?.data as unknown as string) || broadcast.status;
    const isLive = currentStatus === "live";
    const [isTransitioning, setIsTransitioning] = useState(false);

    // ─── Transition broadcast status (testing / live) ────
    const handleTransition = (targetStatus: string) => {
        console.log("[handleTransition] broadcast.id:", broadcast.id, "targetStatus:", targetStatus);
        setIsTransitioning(true);
        updateStatus.mutate(
            { broadcastId: broadcast.id, status: targetStatus },
            {
                onSuccess: () => {
                    toast.success(
                        targetStatus === "live"
                            ? "Transitioning to live!"
                            : "Starting test stream…"
                    );
                    setIsTransitioning(false);
                },
                onError: (err) => {
                    toast.error(`Failed: ${err.message}`);
                    setIsTransitioning(false);
                },
            }
        );
    };

    // ─── WebSocket Connection ────────────────────────────
    useEffect(() => {
        let ws: WebSocket;

        const connect = async () => {
            console.log("[WS] Fetching auth token...");
            const token = await getToken();
            if (!token) {
                console.error("[WS] ❌ No auth token available — user may not be signed in");
                return;
            }
            console.log("[WS] ✅ Token fetched (first 20 chars):", token.slice(0, 20) + "...");

            const backendUrl = process.env.NEXT_PUBLIC_GO_BACKEND_URL || "http://localhost:8080";
            const wsBase = backendUrl.replace(/^http/, "ws") + "/ws/stream";
            const wsUrl = `${wsBase}?token=${encodeURIComponent(token)}`;
            console.log("[WS] Connecting to:", wsBase + "?token=<redacted>");

            ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log("[WS] ✅ Connected! readyState:", ws.readyState);
            };
            ws.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);
                    console.log("[WS] 📨 Message received — type:", msg.type, "| full:", msg);
                } catch {
                    console.log("[WS] 📦 Binary data received, size:", event.data?.size ?? "unknown");
                }
            };
            ws.onerror = (err) => {
                console.error("[WS] ❌ Error event fired. readyState:", ws.readyState, err);
            };
            ws.onclose = (event) => {
                console.warn("[WS] 🔌 Disconnected — code:", event.code, "| reason:", event.reason || "(none)", "| wasClean:", event.wasClean);
            };
        };

        connect();

        return () => {
            console.log("[WS] Cleanup — closing connection");
            ws?.close();
        };
    }, [getToken]);

    // ─── Start webcam ────────────────────────────────────
    const startWebcam = useCallback(async () => {
        console.log("[CAM] Requesting camera + mic access...");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            console.log("[CAM] ✅ Got stream — tracks:", stream.getTracks().map(t => `${t.kind}:${t.label}`));
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setLocalStream(stream);
            return stream;
        } catch (err) {
            console.error("[CAM] ❌ Failed to access webcam:", err);
            toast.error("Could not access camera. Check permissions.");
            return null;
        }
    }, []);

    // ─── Stop webcam ─────────────────────────────────────
    const stopWebcam = useCallback(() => {
        if (localStream) {
            localStream.getTracks().forEach((t) => t.stop());
            if (videoRef.current) videoRef.current.srcObject = null;
            setLocalStream(null);
        }
    }, [localStream]);

    // ─── Go Live ─────────────────────────────────────────
    const handleGoLive = async () => {
        console.log("[LIVE] Go Live clicked");
        setIsStarting(true);
        try {
            const stream = await startWebcam();
            if (!stream) {
                console.error("[LIVE] ❌ No stream — aborting");
                setIsStarting(false);
                return;
            }

            // Send start message via WebSocket
            const wsState = wsRef.current?.readyState;
            console.log("[LIVE] WS readyState before sending start:", wsState,
                wsState === WebSocket.OPEN ? "(OPEN ✅)" :
                    wsState === WebSocket.CONNECTING ? "(CONNECTING ⏳)" :
                        wsState === WebSocket.CLOSING ? "(CLOSING ⚠️)" :
                            wsState === WebSocket.CLOSED ? "(CLOSED ❌)" : "(null/undefined)"
            );

            if (wsRef.current?.readyState === WebSocket.OPEN) {
                const startMsg: Record<string, string> = {
                    type: "start",
                    broadcastId: broadcast.id,
                };
                if (overlayUrl) startMsg.overlayUrl = overlayUrl;
                console.log("[LIVE] Sending start message:", startMsg);
                wsRef.current.send(JSON.stringify(startMsg));
            } else {
                console.warn("[LIVE] ⚠️ WS not open — start message NOT sent. Stream data will not reach backend.");
            }

            // Start MediaRecorder to send video chunks
            const mimeType = "video/webm; codecs=h264,opus";
            const supported = MediaRecorder.isTypeSupported(mimeType);
            console.log(`[RECORDER] mimeType "${mimeType}" supported:`, supported);
            if (!supported) {
                console.warn("[RECORDER] ⚠️ h264 not supported, falling back to default");
            }

            const recorder = new MediaRecorder(stream, {
                mimeType: supported ? mimeType : undefined,
                audioBitsPerSecond: 128000,
                videoBitsPerSecond: 4500000,
            });
            console.log("[RECORDER] Created — actual mimeType:", recorder.mimeType);

            recorder.ondataavailable = (ev) => {
                const wsOpen = wsRef.current?.readyState === WebSocket.OPEN;
                console.log(`[RECORDER] Chunk: ${ev.data.size} bytes | WS open: ${wsOpen}`);
                if (wsOpen && ev.data.size > 0) {
                    wsRef.current!.send(ev.data);
                } else if (!wsOpen) {
                    console.warn("[RECORDER] ⚠️ WS closed — chunk dropped");
                }
            };

            recorder.onerror = (err) => console.error("[RECORDER] ❌ Error:", err);
            recorder.onstart = () => console.log("[RECORDER] ▶️ Started recording");
            recorder.onstop = () => console.log("[RECORDER] ⏹️ Stopped recording");

            recorder.start(750);
            mediaRecorderRef.current = recorder;

            setIsStreaming(true);
            toast.success("Stream started!");
            console.log("[LIVE] ✅ Streaming started");
        } catch (err) {
            console.error("[LIVE] ❌ Go live failed:", err);
            toast.error("Failed to start stream");
        } finally {
            setIsStarting(false);
        }
    };

    // ─── Stop Stream ─────────────────────────────────────
    const handleStopStream = async () => {
        console.log("[STOP] Stop stream clicked");
        setIsStopping(true);
        try {
            // Stop MediaRecorder
            const recState = mediaRecorderRef.current?.state;
            console.log("[STOP] MediaRecorder state:", recState);
            if (recState === "recording") {
                mediaRecorderRef.current!.stop();
            }

            // Send stop via WebSocket
            const wsState = wsRef.current?.readyState;
            console.log("[STOP] WS readyState:", wsState);
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                console.log("[STOP] Sending stop message");
                wsRef.current.send(JSON.stringify({ type: "stop" }));
            } else {
                console.warn("[STOP] ⚠️ WS not open — stop message not sent");
            }

            // Update status to complete
            updateStatus.mutate(
                { broadcastId: broadcast.id, status: "complete" as BroadcastStatus },
                {
                    onSuccess: () => {
                        console.log("[STOP] ✅ Broadcast status updated to complete");
                        toast.success("Stream ended successfully");
                    },
                    onError: (err) => {
                        console.error("[STOP] ❌ Failed to update broadcast status:", err);
                    },
                }
            );

            stopWebcam();
            setIsStreaming(false);
            console.log("[STOP] ✅ Stream stopped");
        } catch (err) {
            console.error("[STOP] ❌ Stop stream failed:", err);
            toast.error("Failed to stop stream");
        } finally {
            setIsStopping(false);
        }
    };

    // ─── Toggle Video/Audio ──────────────────────────────
    const handleToggleVideo = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach((t) => {
                t.enabled = !t.enabled;
            });
            setIsVideoOn((prev) => !prev);
        }
    };

    const handleToggleAudio = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach((t) => {
                t.enabled = !t.enabled;
            });
            setIsAudioOn((prev) => !prev);
        }
    };

    // ─── Overlay change while streaming ──────────────────
    const handleOverlayChange = (url: string | undefined) => {
        setOverlayUrl(url);
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(
                JSON.stringify({
                    type: "switch-overlay",
                    overlayUrl: url || "",
                })
            );
        }
    };

    return (
        <main className="min-h-screen p-4 lg:p-6">
            <StudioHeader broadcast={broadcast} currentStatus={currentStatus} />

            <AnimatePresence>
                {currentStatus !== "live" && currentStatus !== "complete" && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <LifecycleStepper
                            currentStatus={currentStatus}
                            onGoLive={handleGoLive}
                            onStopStream={handleStopStream}
                            onTransition={handleTransition}
                            isStarting={isStarting}
                            isStopping={isStopping}
                            isTransitioning={isTransitioning}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-12 gap-4 lg:gap-5" style={{ height: `calc(100vh - ${currentStatus === "live" || currentStatus === "complete" ? "120px" : "200px"})` }}>
                {/* ═══ Left: Video + Controls + Stats ═══ */}
                <div className="col-span-12 lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
                    <VideoPreview
                        videoRef={videoRef}
                        isStreaming={isStreaming}
                        overlayUrl={overlayUrl}
                        isLive={isLive}
                        onGoLive={handleGoLive}
                        isStarting={isStarting}
                    />

                    <StreamControls
                        isStreaming={isStreaming}
                        isVideoOn={isVideoOn}
                        isAudioOn={isAudioOn}
                        broadcastYoutubeId={broadcast.id}
                        onToggleVideo={handleToggleVideo}
                        onToggleAudio={handleToggleAudio}
                        onStopStream={handleStopStream}
                        isStopping={isStopping}
                    />

                    <StatsBar broadcastId={broadcast.id} isLive={isLive} />
                </div>

                {/* ═══ Right: Chat / Overlays / Blocked Users ═══ */}
                <div className="col-span-12 lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
                    <Tabs defaultValue="chat" className="flex-1 flex flex-col min-h-0">
                        <TabsList className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl p-1 h-auto gap-1">
                            <TabsTrigger
                                value="chat"
                                className="flex-1 rounded-lg text-xs py-2 data-[state=active]:bg-white/[0.08] data-[state=active]:text-white transition-all"
                            >
                                Chat
                            </TabsTrigger>
                            <TabsTrigger
                                value="overlays"
                                className="flex-1 rounded-lg text-xs py-2 data-[state=active]:bg-white/[0.08] data-[state=active]:text-white transition-all"
                            >
                                Overlays
                            </TabsTrigger>
                            <TabsTrigger
                                value="moderation"
                                className="flex-1 rounded-lg text-xs py-2 data-[state=active]:bg-white/[0.08] data-[state=active]:text-white transition-all"
                            >
                                Moderation
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="chat" className="flex-1 mt-3 min-h-0">
                            <ChatPanel liveChatId={broadcast.liveChatId} />
                        </TabsContent>

                        <TabsContent value="overlays" className="flex-1 mt-3 min-h-0">
                            <OverlayPanel
                                activeOverlayUrl={overlayUrl}
                                onSelectOverlay={handleOverlayChange}
                            />
                        </TabsContent>

                        <TabsContent value="moderation" className="flex-1 mt-3 min-h-0">
                            <BlockedUsersPanel />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </main>
    );
}

// ─── Main Studio Page ────────────────────────────────────
export default function StudioPage() {
    const [selectedBroadcast, setSelectedBroadcast] = useState<Broadcast | null>(null);

    if (!selectedBroadcast) {
        return <BroadcastSelector onSelect={setSelectedBroadcast} />;
    }

    return <StudioView broadcast={selectedBroadcast} />;
}
