"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VideoOff, Loader2, Monitor } from "lucide-react";
import Image from "next/image";

type SourceMode = "camera" | "screen" | "screen+pip";

interface VideoPreviewProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    isStreaming: boolean;
    overlayUrl?: string;
    isLive: boolean;
    onGoLive: () => void;
    isStarting: boolean;
    sourceMode?: SourceMode;
}

export default function VideoPreview({
    videoRef,
    isStreaming,
    overlayUrl,
    isLive,
    onGoLive,
    isStarting,
    sourceMode = "camera",
}: VideoPreviewProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/[0.08] bg-black/40"
        >
            {/* Ambient glow when live */}
            <AnimatePresence>
                {isLive && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-red-500/20 via-pink-500/10 to-violet-500/20 blur-xl -z-10"
                    />
                )}
            </AnimatePresence>

            {/* Video element */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transition-opacity duration-500 ${isStreaming ? "opacity-100" : "opacity-0"
                    }`}
            />

            {/* Overlay image */}
            <AnimatePresence>
                {overlayUrl && isStreaming && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 z-10"
                    >
                        <Image
                            src={overlayUrl}
                            alt="Stream overlay"
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Camera off / Go Live state */}
            {!isStreaming && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                    {/* Animated mesh background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-950/40 via-black to-indigo-950/40" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.08),transparent_70%)]" />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="relative z-10 flex flex-col items-center gap-4"
                    >
                        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
                            <VideoOff className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">Camera is off</p>

                        {/* Go Live button with animated border */}
                        <button
                            onClick={onGoLive}
                            disabled={isStarting}
                            className="group relative mt-2 inline-flex h-12 overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-2 focus:ring-violet-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {/* Spinning conic gradient border */}
                            <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#7c3aed_0%,#ec4899_25%,#f59e0b_50%,#7c3aed_75%,#ec4899_100%)]" />
                            <span className="relative inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-[oklch(0.13_0.005_285)] px-8 py-1 text-sm font-semibold text-white gap-2 group-hover:bg-[oklch(0.16_0.005_285)] transition-colors">
                                {isStarting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Starting...
                                    </>
                                ) : (
                                    "Go Live"
                                )}
                            </span>
                        </button>
                    </motion.div>
                </div>
            )}

            {/* Status badges — top-left */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                <AnimatePresence>
                    {isLive && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/90 backdrop-blur-sm"
                        >
                            <span className="relative w-2 h-2">
                                <span className="absolute inset-0 rounded-full bg-white animate-ping" />
                                <span className="relative block w-2 h-2 rounded-full bg-white" />
                            </span>
                            <span className="text-xs font-bold text-white tracking-wider">LIVE</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {isStreaming && sourceMode !== "camera" && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-500/80 backdrop-blur-sm"
                        >
                            <Monitor className="w-3 h-3 text-white" />
                            <span className="text-xs font-bold text-white tracking-wider">
                                {sourceMode === "screen+pip" ? "SCREEN+PiP" : "SCREEN"}
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
