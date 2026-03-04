"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import {
    Radio,
    Tv,
    Users,
    Clock,
    Youtube,
    ExternalLink,
    CalendarDays,
    Eye,
    Loader2,
    AlertCircle,
    CheckCircle,
    ArrowRight,
    Unplug,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import CreateBroadcastDialog from "@/components/dashboard/create-broadcast-dialog";
import {
    useBroadcasts,
    useYouTubeStatus,
    useYouTubeInfo,
    useInitiateYouTubeOAuth,
    useDisconnectYouTube,
} from "@/services/api";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Broadcast, BroadcastStatus } from "@/types";

// ─── Status helpers ──────────────────────────────────────
const statusConfig: Record<
    BroadcastStatus,
    { label: string; color: string; dot: string }
> = {
    created: { label: "Ready", color: "text-blue-400 bg-blue-500/10 border-blue-500/20", dot: "bg-blue-400" },
    ready: { label: "Ready", color: "text-blue-400 bg-blue-500/10 border-blue-500/20", dot: "bg-blue-400" },
    testStarting: { label: "Test Starting", color: "text-amber-400 bg-amber-500/10 border-amber-500/20", dot: "bg-amber-400" },
    testing: { label: "Testing", color: "text-amber-400 bg-amber-500/10 border-amber-500/20", dot: "bg-amber-400" },
    liveStarting: { label: "Going Live", color: "text-orange-400 bg-orange-500/10 border-orange-500/20", dot: "bg-orange-400 animate-pulse" },
    live: { label: "Live", color: "text-red-400 bg-red-500/10 border-red-500/20", dot: "bg-red-500 animate-pulse" },
    complete: { label: "Ended", color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20", dot: "bg-zinc-400" },
    revoked: { label: "Revoked", color: "text-zinc-500 bg-zinc-500/10 border-zinc-500/20", dot: "bg-zinc-500" },
    expired: { label: "Expired", color: "text-zinc-500 bg-zinc-500/10 border-zinc-500/20", dot: "bg-zinc-500" },
};

function StatusBadge({ status }: { status: BroadcastStatus }) {
    const config = statusConfig[status] || statusConfig.ready;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${config.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
            {config.label}
        </span>
    );
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

// ─── Stat Card ───────────────────────────────────────────
function StatCard({
    icon: Icon,
    label,
    value,
    gradient,
    delay = 0,
}: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    gradient: string;
    delay?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            className="glass rounded-2xl p-5 hover:bg-white/[0.04] transition-all group"
        >
            <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                    <p className="text-2xl font-bold tracking-tight">{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                </div>
            </div>
        </motion.div>
    );
}

// ─── YouTube Connection Card ─────────────────────────────
function YouTubeCard() {
    const { data: statusData, isLoading: statusLoading } = useYouTubeStatus();
    const { data: infoData, isLoading: infoLoading } = useYouTubeInfo();
    const initiateOAuth = useInitiateYouTubeOAuth();
    const disconnectYouTube = useDisconnectYouTube();

    // statusData is flat: { connected, channel_id, ... }
    const isConnected = statusData?.connected;
    // infoData is { success, data: <raw YouTube Channel> }
    const channelInfo = infoData?.data;

    const handleConnect = () => {
        initiateOAuth.mutate(undefined, {
            onSuccess: (data) => {
                // Redirect the browser to Google OAuth consent screen
                window.location.href = data.auth_url;
            },
            onError: (error) => {
                toast.error(`Failed to start YouTube connection: ${error.message}`);
            },
        });
    };

    const handleDisconnect = () => {
        disconnectYouTube.mutate(undefined, {
            onSuccess: () => {
                toast.success("YouTube channel disconnected");
            },
            onError: (error) => {
                toast.error(`Failed to disconnect: ${error.message}`);
            },
        });
    };

    if (statusLoading || infoLoading) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="glass rounded-2xl p-6"
            >
                <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Checking YouTube connection...</span>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="glass rounded-2xl p-6 relative overflow-hidden"
        >
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-red-500/10 to-transparent rounded-full blur-3xl" />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg">
                            <Youtube className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm">YouTube Connection</h3>
                            <p className="text-xs text-muted-foreground">
                                {isConnected ? "Your channel is linked" : "Connect to start streaming"}
                            </p>
                        </div>
                    </div>
                    {isConnected ? (
                        <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Connected
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5 text-xs text-amber-400">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Not Connected
                        </span>
                    )}
                </div>

                {isConnected && channelInfo ? (
                    <>
                        <div className="flex items-center gap-4 mt-3 p-3 rounded-xl bg-white/[0.03]">
                            {channelInfo.snippet?.thumbnails?.medium?.url && (
                                <img
                                    src={channelInfo.snippet.thumbnails.medium.url}
                                    alt={channelInfo.snippet.title}
                                    className="w-10 h-10 rounded-full ring-2 ring-white/10"
                                />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{channelInfo.snippet?.title}</p>
                                <p className="text-xs text-muted-foreground">
                                    {channelInfo.statistics?.subscriberCount} subscribers · {channelInfo.statistics?.videoCount} videos
                                </p>
                            </div>
                            <a
                                href={`https://youtube.com/channel/${channelInfo.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
                            >
                                <ExternalLink className="w-4 h-4 text-muted-foreground" />
                            </a>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDisconnect}
                            disabled={disconnectYouTube.isPending}
                            className="w-full mt-3 text-xs text-muted-foreground hover:text-red-400 hover:bg-red-500/10 gap-1.5"
                        >
                            {disconnectYouTube.isPending ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Unplug className="w-3.5 h-3.5" />
                            )}
                            Disconnect Channel
                        </Button>
                    </>
                ) : (
                    <Button
                        variant="outline"
                        onClick={handleConnect}
                        disabled={initiateOAuth.isPending}
                        className="w-full mt-2 border-white/[0.08] hover:bg-white/[0.04] gap-2"
                    >
                        {initiateOAuth.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Youtube className="w-4 h-4" />
                        )}
                        Connect YouTube Account
                    </Button>
                )}
            </div>
        </motion.div>
    );
}

// ─── Broadcast Row ───────────────────────────────────────
function BroadcastRow({ broadcast, index }: { broadcast: Broadcast; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="group flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-white/[0.03] transition-colors"
        >
            {/* Icon */}
            <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0 group-hover:bg-white/[0.06] transition-colors">
                <Tv className="w-4 h-4 text-muted-foreground" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{broadcast.title}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        {formatDate(broadcast.scheduledStartTime)}
                    </span>
                </div>
            </div>

            {/* Status */}
            <StatusBadge status={broadcast.status} />

            {/* Go to studio */}
            {(broadcast.status === "ready" || broadcast.status === "live") && (
                <Link
                    href={`/studio?broadcastId=${broadcast.id}`}
                    className="p-2 rounded-lg hover:bg-violet-500/10 transition-colors"
                >
                    <ArrowRight className="w-4 h-4 text-violet-400" />
                </Link>
            )}
        </motion.div>
    );
}

// ─── Dashboard Page ──────────────────────────────────────
export default function DashboardPage() {
    const { data: broadcastsData, isLoading, isError } = useBroadcasts();
    const broadcasts = broadcastsData?.data ?? [];
    const searchParams = useSearchParams();
    const router = useRouter();
    const queryClient = useQueryClient();

    // Handle YouTube OAuth redirect params
    useEffect(() => {
        const youtubeConnected = searchParams.get("youtube_connected");
        const youtubeError = searchParams.get("youtube_error");

        if (youtubeConnected === "true") {
            toast.success("YouTube channel connected successfully!");
            queryClient.invalidateQueries({ queryKey: ["youtube"] });
            // Clean URL
            router.replace("/dashboard", { scroll: false });
        } else if (youtubeError) {
            const errorMessages: Record<string, string> = {
                missing_params: "OAuth callback missing required parameters",
                invalid_state: "Invalid OAuth state — please try again",
                invalid_user: "Could not identify your account",
                token_exchange_failed: "Failed to exchange authorization code",
                db_error: "Database error while saving connection",
            };
            toast.error(errorMessages[youtubeError] || `YouTube connection failed: ${youtubeError}`);
            router.replace("/dashboard", { scroll: false });
        }
    }, [searchParams, queryClient, router]);

    const liveCount = broadcasts.filter((b) => b.status === "live").length;
    const totalCount = broadcasts.length;
    const recentBroadcasts = [...broadcasts].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return (
        <main className="min-h-screen p-6 lg:p-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
            >
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage broadcasts, monitor streams, and track performance.
                    </p>
                </div>
                <CreateBroadcastDialog />
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    icon={Radio}
                    label="Total Broadcasts"
                    value={totalCount}
                    gradient="from-violet-500 to-indigo-600"
                    delay={0}
                />
                <StatCard
                    icon={Tv}
                    label="Live Now"
                    value={liveCount}
                    gradient="from-red-500 to-rose-600"
                    delay={0.05}
                />
                <StatCard
                    icon={Users}
                    label="Viewers Today"
                    value="—"
                    gradient="from-emerald-500 to-teal-600"
                    delay={0.1}
                />
                <StatCard
                    icon={Clock}
                    label="Stream Hours"
                    value="—"
                    gradient="from-amber-500 to-orange-600"
                    delay={0.15}
                />
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Broadcast History — takes 2 cols */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="lg:col-span-2 glass rounded-2xl p-6"
                >
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="text-lg font-semibold">Broadcasts</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Your broadcast history and upcoming streams
                            </p>
                        </div>
                        <Badge variant="secondary" className="bg-white/[0.04] text-muted-foreground border-white/[0.08]">
                            {totalCount} total
                        </Badge>
                    </div>

                    <Separator className="bg-white/[0.06] mb-4" />

                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : isError ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <AlertCircle className="w-8 h-8 text-red-400/60 mb-3" />
                            <p className="text-sm text-muted-foreground">Failed to load broadcasts</p>
                            <p className="text-xs text-muted-foreground/60 mt-1">Check your connection and try again</p>
                        </div>
                    ) : recentBroadcasts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="p-4 rounded-2xl bg-white/[0.03] mb-4">
                                <Tv className="w-8 h-8 text-muted-foreground/40" />
                            </div>
                            <p className="text-sm text-muted-foreground">No broadcasts yet</p>
                            <p className="text-xs text-muted-foreground/60 mt-1">
                                Create your first broadcast to get started
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {recentBroadcasts.map((broadcast, index) => (
                                <BroadcastRow key={broadcast.id} broadcast={broadcast} index={index} />
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Right column */}
                <div className="space-y-6">
                    <YouTubeCard />

                    {/* Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 }}
                        className="glass rounded-2xl p-6"
                    >
                        <h3 className="font-semibold text-sm mb-4">Quick Actions</h3>
                        <div className="space-y-2">
                            <Link
                                href="/studio"
                                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/[0.04] transition-colors group"
                            >
                                <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-500/20 group-hover:from-violet-500/30 group-hover:to-indigo-500/30 transition-colors">
                                    <Tv className="w-4 h-4 text-violet-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Open Studio</p>
                                    <p className="text-xs text-muted-foreground">Go live or test your stream</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>

                            <Link
                                href="/settings"
                                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/[0.04] transition-colors group"
                            >
                                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 group-hover:from-emerald-500/30 group-hover:to-teal-500/30 transition-colors">
                                    <Eye className="w-4 h-4 text-emerald-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Stream Settings</p>
                                    <p className="text-xs text-muted-foreground">Configure overlays &amp; moderation</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
