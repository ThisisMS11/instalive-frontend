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
import { useRouter } from "next/navigation";
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
import BroadcastSettingsPanel from "@/components/studio/broadcast-settings-panel";
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

type SourceMode = "camera" | "screen" | "screen+pip";

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

    // Screen sharing state & refs
    const [sourceMode, setSourceMode] = useState<SourceMode>("camera");
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const screenStreamRef = useRef<MediaStream | null>(null);
    const webcamStreamRef = useRef<MediaStream | null>(null);
    const pipCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const pipRafRef = useRef<number | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const compositeStreamRef = useRef<MediaStream | null>(null);
    // Always-current ref for the stop function (avoids stale closures in onended)
    const stopScreenShareRef = useRef<() => void>(() => {});

    const isDisplayMediaSupported =
        typeof window !== "undefined" &&
        typeof navigator.mediaDevices?.getDisplayMedia === "function";

    const { getToken } = useAuth();
    const router = useRouter();
    const { data: statusData } = useBroadcastStatus(broadcast.id);
    const updateStatus = useUpdateBroadcastStatus();
    const currentStatus = (statusData?.data as unknown as string) || broadcast.status;
    const isLive = currentStatus === "live";
    const [isTransitioning, setIsTransitioning] = useState(false);
    const localStreamRef = useRef<MediaStream | null>(null);
    const autoStoppedRef = useRef(false);

    // ─── Stop webcam (also cleans up any screen share resources) ────
    const stopWebcam = useCallback(() => {
        // Tear down PiP compositor
        if (pipRafRef.current) { cancelAnimationFrame(pipRafRef.current); pipRafRef.current = null; }
        if (audioCtxRef.current) { audioCtxRef.current.close(); audioCtxRef.current = null; }
        compositeStreamRef.current?.getTracks().forEach((t) => t.stop());
        compositeStreamRef.current = null;
        screenStreamRef.current?.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
        webcamStreamRef.current = null;
        setIsScreenSharing(false);
        setSourceMode("camera");

        if (localStream) {
            localStream.getTracks().forEach((t) => t.stop());
            if (videoRef.current) videoRef.current.srcObject = null;
            setLocalStream(null);
            localStreamRef.current = null;
        }
    }, [localStream]);

    // ─── Auto-stop when YouTube ends the stream externally ──
    useEffect(() => {
        if (currentStatus === "complete" && isStreaming && !autoStoppedRef.current) {
            autoStoppedRef.current = true;

            // Stop MediaRecorder
            const rec = mediaRecorderRef.current;
            mediaRecorderRef.current = null;
            if (rec?.state === "recording") rec.stop();

            // Signal backend to stop FFmpeg
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ type: "stop" }));
            }

            // Tear down camera / screen share
            stopWebcam();
            setIsStreaming(false);

            toast.info("YouTube ended your broadcast. Redirecting to dashboard…", {
                duration: 4000,
            });
            setTimeout(() => router.push("/dashboard"), 3500);
        }
    }, [currentStatus, isStreaming, stopWebcam, router]);

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

    // ─── Start MediaRecorder ─────────────────────────────
    const startRecorder = useCallback((stream: MediaStream) => {
        const mimeType = "video/webm; codecs=h264,opus";
        const supported = MediaRecorder.isTypeSupported(mimeType);
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
            // Discard if this recorder has been superseded (e.g. during overlay switch)
            if (recorder !== mediaRecorderRef.current) return;
            const wsOpen = wsRef.current?.readyState === WebSocket.OPEN;
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
        return recorder;
    }, []);

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

                    if (msg.type === "restart-recorder") {
                        // Backend restarted FFmpeg — recorder is already stopped by
                        // handleOverlayChange. Start a fresh one after a brief delay so
                        // the new FFmpeg process is ready to receive the EBML header.
                        console.log("[RECORDER] 🔄 Starting fresh MediaRecorder for overlay switch");
                        setTimeout(() => {
                            const stream = localStreamRef.current;
                            if (stream) {
                                startRecorder(stream);
                            }
                        }, 500);
                    }
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
    }, [getToken, startRecorder]);

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
            localStreamRef.current = stream;
            webcamStreamRef.current = stream;
            return stream;
        } catch (err) {
            console.error("[CAM] ❌ Failed to access webcam:", err);
            toast.error("Could not access camera. Check permissions.");
            return null;
        }
    }, []);

    // ─── Screen sharing helpers ──────────────────────────

    /** Merge multiple audio tracks into one via Web Audio API. */
    const mergeAudioTracks = (tracks: MediaStreamTrack[]): MediaStreamTrack | null => {
        const live = tracks.filter(Boolean);
        if (live.length === 0) return null;
        if (live.length === 1) return live[0];
        const ctx = new AudioContext();
        audioCtxRef.current = ctx;
        const dest = ctx.createMediaStreamDestination();
        live.forEach((t) => ctx.createMediaStreamSource(new MediaStream([t])).connect(dest));
        return dest.stream.getAudioTracks()[0] ?? null;
    };

    /** Build a canvas-composited stream: screen full-frame + webcam PiP. */
    const startPipCompositor = async (): Promise<MediaStream> => {
        const canvas = document.createElement("canvas");
        canvas.width = 1280;
        canvas.height = 720;
        pipCanvasRef.current = canvas;
        const ctx2d = canvas.getContext("2d")!;

        // Hidden video elements — no need to attach to DOM
        const screenVid = document.createElement("video");
        screenVid.srcObject = screenStreamRef.current;
        screenVid.muted = true;
        screenVid.playsInline = true;

        const camVid = document.createElement("video");
        camVid.srcObject = webcamStreamRef.current;
        camVid.muted = true;
        camVid.playsInline = true;

        // Wait for both sources to be ready before drawing
        await Promise.all([
            new Promise<void>((r) => { screenVid.oncanplay = () => r(); screenVid.play().catch(() => r()); }),
            new Promise<void>((r) => { camVid.oncanplay = () => r(); camVid.play().catch(() => r()); }),
        ]);

        const PIP_W = 240, PIP_H = 135, MARGIN = 16;
        const draw = () => {
            ctx2d.drawImage(screenVid, 0, 0, 1280, 720);
            ctx2d.drawImage(camVid, 1280 - PIP_W - MARGIN, 720 - PIP_H - MARGIN, PIP_W, PIP_H);
            pipRafRef.current = requestAnimationFrame(draw);
        };
        draw();

        const composite = (canvas as any).captureStream(30) as MediaStream;
        compositeStreamRef.current = composite;
        return composite;
    };

    /** Build the final MediaStream for a given source mode using existing refs. */
    const buildSourceStream = async (mode: "screen" | "screen+pip"): Promise<MediaStream> => {
        const screenAudio = screenStreamRef.current?.getAudioTracks()[0] ?? null;
        const micAudio = webcamStreamRef.current?.getAudioTracks()[0] ?? null;

        if (mode === "screen+pip") {
            const composite = await startPipCompositor();
            const mergedAudio = mergeAudioTracks([screenAudio, micAudio].filter(Boolean) as MediaStreamTrack[]);
            const tracks: MediaStreamTrack[] = [...composite.getVideoTracks()];
            if (mergedAudio) tracks.push(mergedAudio);
            return new MediaStream(tracks);
        }

        // screen-only
        const mergedAudio = mergeAudioTracks([screenAudio, micAudio].filter(Boolean) as MediaStreamTrack[]);
        const tracks: MediaStreamTrack[] = [...(screenStreamRef.current?.getVideoTracks() ?? [])];
        if (mergedAudio) tracks.push(mergedAudio);
        return new MediaStream(tracks);
    };

    /** Hot-swap the active MediaStream and restart FFmpeg via the existing switch-overlay pattern. */
    const swapStream = (newStream: MediaStream) => {
        localStreamRef.current = newStream;
        if (videoRef.current) videoRef.current.srcObject = newStream;

        if (isStreaming) {
            const prev = mediaRecorderRef.current;
            mediaRecorderRef.current = null;
            if (prev?.state === "recording") prev.stop();
            wsRef.current?.send(JSON.stringify({ type: "switch-overlay", overlayUrl: overlayUrl || "" }));
        }
    };

    /** Tear down compositor resources without stopping the screen stream. */
    const teardownCompositor = async () => {
        if (pipRafRef.current) { cancelAnimationFrame(pipRafRef.current); pipRafRef.current = null; }
        if (audioCtxRef.current) { await audioCtxRef.current.close(); audioCtxRef.current = null; }
        compositeStreamRef.current?.getTracks().forEach((t) => t.stop());
        compositeStreamRef.current = null;
    };

    const stopScreenShare = async () => {
        await teardownCompositor();
        screenStreamRef.current?.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;

        // Fall back to webcam
        const cam = webcamStreamRef.current;
        if (cam) {
            swapStream(cam);
            setLocalStream(cam);
        }

        setIsScreenSharing(false);
        setSourceMode("camera");
    };

    // Keep the ref current so the onended handler always calls the latest version
    stopScreenShareRef.current = stopScreenShare;

    const startScreenShare = async (mode: "screen" | "screen+pip") => {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: { frameRate: 30 } as MediaTrackConstraints,
                audio: true,
            });
            screenStreamRef.current = screenStream;

            // Honour the OS "Stop sharing" button
            screenStream.getVideoTracks()[0]?.addEventListener("ended", () => {
                stopScreenShareRef.current();
            });

            // Ensure webcam is available for PiP or audio fallback
            if (!webcamStreamRef.current) {
                const cam = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }).catch(() => null);
                if (cam) {
                    webcamStreamRef.current = cam;
                    setLocalStream(cam);
                    localStreamRef.current = cam;
                }
            }

            const finalStream = await buildSourceStream(mode);
            swapStream(finalStream);
            setIsScreenSharing(true);
            setSourceMode(mode);

            // If not yet streaming, update the local stream state so video preview works
            if (!isStreaming) {
                setLocalStream(finalStream);
                localStreamRef.current = finalStream;
                if (videoRef.current) videoRef.current.srcObject = finalStream;
            }
        } catch (err) {
            console.error("[SCREEN] Failed to start screen share:", err);
            toast.error("Could not start screen sharing. Check permissions.");
        }
    };

    /** Switch between screen and screen+pip modes without re-prompting for screen. */
    const switchPipMode = async (newMode: "screen" | "screen+pip") => {
        if (!screenStreamRef.current) return;
        await teardownCompositor();
        const finalStream = await buildSourceStream(newMode);
        swapStream(finalStream);
        setSourceMode(newMode);
    };

    const handleToggleScreenShare = async (mode: "screen" | "screen+pip") => {
        if (isScreenSharing) {
            // Already sharing — toggle PiP without re-prompting
            if (mode !== sourceMode) await switchPipMode(mode);
        } else {
            await startScreenShare(mode);
        }
    };

    // ─── Go Live ─────────────────────────────────────────
    const handleGoLive = async () => {
        console.log("[LIVE] Go Live clicked");
        setIsStarting(true);
        try {
            // If screen sharing was started before going live, use that stream
            let stream: MediaStream | null = isScreenSharing ? localStreamRef.current : null;
            if (!stream) {
                stream = await startWebcam();
            }
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

            // Start MediaRecorder — use localStreamRef so screen share is picked up
            startRecorder(localStreamRef.current ?? stream);

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
            // Nullify the ref first so ondataavailable discards the final flush chunk,
            // then stop — preventing mid-stream WebM data from reaching the new FFmpeg.
            const prev = mediaRecorderRef.current;
            mediaRecorderRef.current = null;
            if (prev && prev.state === "recording") {
                prev.stop();
            }
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
                        sourceMode={sourceMode}
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
                        isScreenSharing={isScreenSharing}
                        sourceMode={sourceMode}
                        isDisplayMediaSupported={isDisplayMediaSupported}
                        onToggleScreenShare={handleToggleScreenShare}
                        onStopScreenShare={stopScreenShare}
                    />

                    <StatsBar broadcastId={broadcast.id} isLive={isLive} />
                </div>

                {/* ═══ Right: Chat / Overlays / Blocked Users ═══ */}
                <div className="col-span-12 lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
                    <Tabs defaultValue="chat" className="flex-1 flex flex-col min-h-0">
                        <TabsList className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl p-1 h-auto gap-1 flex-wrap">
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
                            <TabsTrigger
                                value="settings"
                                className="flex-1 rounded-lg text-xs py-2 data-[state=active]:bg-white/[0.08] data-[state=active]:text-white transition-all"
                            >
                                Settings
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="chat" className="flex-1 mt-3 min-h-0">
                            <ChatPanel liveChatId={broadcast.liveChatId} streamerChannelId={broadcast.channelId} />
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

                        <TabsContent value="settings" className="flex-1 mt-3 min-h-0">
                            <BroadcastSettingsPanel broadcastId={broadcast.id} />
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
