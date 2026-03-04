"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Radio, Copy, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import Link from "next/link";
import { useState } from "react";
import type { Broadcast, BroadcastStatus } from "@/types";

interface StudioHeaderProps {
    broadcast: Broadcast;
    currentStatus?: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
    created: { label: "Created", color: "bg-blue-500" },
    ready: { label: "Ready", color: "bg-violet-500" },
    testStarting: { label: "Starting Test", color: "bg-amber-500" },
    testing: { label: "Testing", color: "bg-amber-400" },
    liveStarting: { label: "Going Live", color: "bg-orange-500" },
    live: { label: "LIVE", color: "bg-red-500" },
    complete: { label: "Complete", color: "bg-zinc-600" },
};

export default function StudioHeader({ broadcast, currentStatus }: StudioHeaderProps) {
    const [copied, setCopied] = useState(false);
    const status = currentStatus || broadcast.status;
    const config = statusConfig[status] || statusConfig.ready;
    const isLive = status === "live";

    const handleCopy = () => {
        navigator.clipboard.writeText(`https://www.youtube.com/watch?v=${broadcast.id}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-between gap-4 mb-6"
        >
            {/* Left: Back + Title */}
            <div className="flex items-center gap-4 min-w-0">
                <Link href="/dashboard">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 rounded-xl hover:bg-white/[0.06]"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                </Link>
                <div className="min-w-0">
                    <h1 className="text-lg font-semibold truncate">{broadcast.title}</h1>
                    <div className="flex items-center gap-2 mt-0.5">
                        {/* Pulsing live indicator */}
                        <span className="relative flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${config.color}`}>
                                {isLive && (
                                    <span className="absolute inset-0 w-2 h-2 rounded-full bg-red-500 animate-ping" />
                                )}
                            </span>
                            <span className={`text-xs font-medium ${isLive ? "text-red-400" : "text-muted-foreground"}`}>
                                {config.label}
                            </span>
                        </span>
                    </div>
                </div>
            </div>



            {/* Right: Actions */}
            <div className="flex items-center gap-2 shrink-0">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="gap-1.5 text-xs text-muted-foreground hover:text-white"
                >
                    {copied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                        <Copy className="w-3.5 h-3.5" />
                    )}
                    {copied ? "Copied!" : "Copy URL"}
                </Button>

                {isLive && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                    >
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 gap-1.5 px-3 py-1">
                            <Radio className="w-3 h-3 animate-pulse" />
                            LIVE
                        </Badge>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
