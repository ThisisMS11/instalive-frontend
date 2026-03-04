"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    Settings,
    FlaskConical,
    Radio,
    CheckCircle,
    Loader2,
    Zap,
    StopCircle,
    Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ─── Lifecycle Definition ────────────────────────────────── */
const steps = [
    {
        key: "ready",
        label: "Ready",
        statuses: ["created", "ready"],
        icon: Settings,
        color: "violet",
        description: "Settings configured — ready to proceed",
    },
    {
        key: "testing",
        label: "Testing",
        statuses: ["testStarting", "testing"],
        icon: FlaskConical,
        color: "amber",
        description: "Preview stream — visible only to you",
    },
    {
        key: "live",
        label: "Live",
        statuses: ["liveStarting", "live"],
        icon: Radio,
        color: "red",
        description: "You are live — broadcasting to your audience",
    },
    {
        key: "complete",
        label: "Complete",
        statuses: ["complete"],
        icon: CheckCircle,
        color: "zinc",
        description: "Broadcast has ended",
    },
];

/* Which statuses are "transitioning" (show spinner) */
const transitionStatuses = new Set(["testStarting", "liveStarting"]);

/* Map step color names to tailwind classes */
const colorMap: Record<string, {
    activeBg: string;
    activeText: string;
    activeGlow: string;
    lineFill: string;
    dotBg: string;
}> = {
    violet: {
        activeBg: "bg-violet-500/20 border-violet-500/40",
        activeText: "text-violet-400",
        activeGlow: "shadow-[0_0_15px_rgba(139,92,246,0.3)]",
        lineFill: "bg-violet-500",
        dotBg: "bg-violet-500",
    },
    amber: {
        activeBg: "bg-amber-500/20 border-amber-500/40",
        activeText: "text-amber-400",
        activeGlow: "shadow-[0_0_15px_rgba(245,158,11,0.3)]",
        lineFill: "bg-amber-500",
        dotBg: "bg-amber-500",
    },
    red: {
        activeBg: "bg-red-500/20 border-red-500/40",
        activeText: "text-red-400",
        activeGlow: "shadow-[0_0_15px_rgba(239,68,68,0.4)]",
        lineFill: "bg-red-500",
        dotBg: "bg-red-500",
    },
    zinc: {
        activeBg: "bg-zinc-500/20 border-zinc-500/40",
        activeText: "text-zinc-400",
        activeGlow: "",
        lineFill: "bg-zinc-500",
        dotBg: "bg-zinc-500",
    },
};

/* ─── Status message helpers ──────────────────────────────── */
function getStatusMessage(status: string): { text: string; accent: string } {
    switch (status) {
        case "created":
            return { text: "Configure your broadcast settings, then start testing", accent: "text-violet-400" };
        case "ready":
            return { text: "Everything is set — start testing when you're ready", accent: "text-violet-400" };
        case "testStarting":
            return { text: "Starting test stream…", accent: "text-amber-400" };
        case "testing":
            return { text: "Test stream active — only visible to you & partners", accent: "text-amber-400" };
        case "liveStarting":
            return { text: "Going live…", accent: "text-orange-400" };
        case "live":
            return { text: "🔴  You are LIVE — broadcasting to your audience", accent: "text-red-400" };
        case "complete":
            return { text: "Broadcast has ended", accent: "text-zinc-400" };
        default:
            return { text: "Waiting…", accent: "text-muted-foreground" };
    }
}

/* ─── Get step index from status ──────────────────────────── */
function getStepIndex(status: string): number {
    const idx = steps.findIndex((s) => s.statuses.includes(status));
    return idx >= 0 ? idx : 0;
}

/* ─── Props ───────────────────────────────────────────────── */
interface LifecycleStepperProps {
    currentStatus: string;
    onGoLive: () => void;
    onStopStream: () => void;
    onTransition: (status: string) => void;
    isStarting: boolean;
    isStopping: boolean;
    isTransitioning: boolean;
}

/* ─── Component ───────────────────────────────────────────── */
export default function LifecycleStepper({
    currentStatus,
    onGoLive,
    onStopStream,
    onTransition,
    isStarting,
    isStopping,
    isTransitioning,
}: LifecycleStepperProps) {
    const currentStepIdx = getStepIndex(currentStatus);
    const isTransitionStatus = transitionStatuses.has(currentStatus);
    const statusMsg = getStatusMessage(currentStatus);

    /* Determine what action button to show */
    const canGoLive = currentStatus === "created" || currentStatus === "ready" || currentStatus === "testing";
    const isLive = currentStatus === "live";
    const isComplete = currentStatus === "complete";

    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="glass rounded-2xl p-4 mb-4"
        >
            {/* ═══ Stepper Row ═══ */}
            <div className="flex items-center gap-0">
                {steps.map((step, i) => {
                    const colors = colorMap[step.color];
                    const isReached = i <= currentStepIdx;
                    const isCurrent = i === currentStepIdx;
                    const isPast = i < currentStepIdx;
                    const Icon = step.icon;

                    return (
                        <div key={step.key} className="flex items-center flex-1 last:flex-none">
                            {/* Step circle */}
                            <div className="flex flex-col items-center gap-1.5 relative">
                                <motion.div
                                    layout
                                    className={cn(
                                        "w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-500 relative",
                                        isCurrent
                                            ? `${colors.activeBg} ${colors.activeGlow}`
                                            : isPast
                                                ? "bg-white/[0.08] border-white/20"
                                                : "bg-white/[0.02] border-white/[0.06]"
                                    )}
                                >
                                    {/* Pulse ring for current step */}
                                    {isCurrent && !isComplete && (
                                        <motion.span
                                            className={cn(
                                                "absolute inset-0 rounded-full",
                                                step.color === "red" ? "bg-red-500/20" :
                                                    step.color === "amber" ? "bg-amber-500/20" :
                                                        "bg-violet-500/20"
                                            )}
                                            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                                        />
                                    )}

                                    {/* Icon or spinner */}
                                    {isCurrent && isTransitionStatus ? (
                                        <Loader2 className={cn("w-4 h-4 animate-spin", colors.activeText)} />
                                    ) : isPast ? (
                                        <CheckCircle className="w-4 h-4 text-white/60" />
                                    ) : (
                                        <Icon
                                            className={cn(
                                                "w-4 h-4 transition-colors duration-300",
                                                isCurrent ? colors.activeText : "text-white/20"
                                            )}
                                        />
                                    )}
                                </motion.div>

                                {/* Label */}
                                <span
                                    className={cn(
                                        "text-[10px] font-semibold uppercase tracking-wider transition-colors duration-300 whitespace-nowrap",
                                        isCurrent
                                            ? colors.activeText
                                            : isPast
                                                ? "text-white/50"
                                                : "text-white/20"
                                    )}
                                >
                                    {step.label}
                                </span>
                            </div>

                            {/* Connecting line (not after last step) */}
                            {i < steps.length - 1 && (
                                <div className="flex-1 mx-2 h-[2px] bg-white/[0.06] rounded-full relative overflow-hidden self-start mt-[17px]">
                                    <motion.div
                                        className={cn(
                                            "absolute inset-y-0 left-0 rounded-full",
                                            isPast
                                                ? colorMap[steps[i + 1].color]?.lineFill || colors.lineFill
                                                : isCurrent
                                                    ? colors.lineFill
                                                    : ""
                                        )}
                                        initial={{ width: "0%" }}
                                        animate={{
                                            width: isPast
                                                ? "100%"
                                                : isCurrent && isTransitionStatus
                                                    ? "60%"
                                                    : isCurrent
                                                        ? "30%"
                                                        : "0%",
                                        }}
                                        transition={{ duration: 0.8, ease: "easeInOut" }}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ═══ Status Message + Action ═══ */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/[0.06]">
                {/* Status text */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStatus}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        transition={{ duration: 0.25 }}
                        className="flex items-center gap-2"
                    >
                        {currentStatus === "live" && (
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                            </span>
                        )}
                        {isTransitionStatus && (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                        )}
                        <span className={cn("text-sm font-medium", statusMsg.accent)}>
                            {statusMsg.text}
                        </span>
                    </motion.div>
                </AnimatePresence>

                {/* Action button */}
                <div className="shrink-0 ml-4">
                    {/* {canTest && (
                        <Button
                            size="sm"
                            onClick={() => onTransition("testing")}
                            disabled={isTransitioning || isStarting}
                            className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-lg shadow-amber-500/20"
                        >
                            {isTransitioning ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Eye className="w-3.5 h-3.5" />
                            )}
                            Start Testing
                        </Button>
                    )} */}

                    {canGoLive && (
                        <Button
                            size="sm"
                            onClick={() => onTransition("live")}
                            disabled={isTransitioning || isStarting}
                            className="gap-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white border-0 shadow-lg shadow-red-500/20"
                        >
                            {isTransitioning ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Zap className="w-3.5 h-3.5" />
                            )}
                            Go Live
                        </Button>
                    )}

                    {isLive && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={onStopStream}
                            disabled={isStopping}
                            className="gap-2 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        >
                            {isStopping ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <StopCircle className="w-3.5 h-3.5" />
                            )}
                            End Stream
                        </Button>
                    )}

                    {isComplete && (
                        <span className="text-xs text-zinc-500 font-medium">Stream ended</span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
