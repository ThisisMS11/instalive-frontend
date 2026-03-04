"use client";

import { motion } from "framer-motion";
import { Eye, MessageCircle, Clock, Activity } from "lucide-react";
import { useBroadcastStats } from "@/services/api";
import { useState, useEffect } from "react";

interface StatsBarProps {
    broadcastId?: string;
    isLive: boolean;
}

function formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function StatsBar({ broadcastId, isLive }: StatsBarProps) {
    const { data: statsData } = useBroadcastStats(broadcastId);
    const [elapsed, setElapsed] = useState(0);

    // Live timer
    useEffect(() => {
        if (!isLive) return;
        const interval = setInterval(() => setElapsed((p) => p + 1), 1000);
        return () => clearInterval(interval);
    }, [isLive]);

    const stats = statsData?.data;

    const items = [
        {
            icon: Eye,
            label: "Viewers",
            value: stats?.concurrentViewers || "0",
            color: "text-violet-400",
        },
        {
            icon: MessageCircle,
            label: "Messages",
            value: stats?.totalChatMessages || "0",
            color: "text-indigo-400",
        },
        {
            icon: Clock,
            label: "Duration",
            value: formatDuration(elapsed),
            color: "text-cyan-400",
        },
        {
            icon: Activity,
            label: "Status",
            value: isLive ? "Live" : "Idle",
            color: isLive ? "text-red-400" : "text-zinc-400",
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="glass rounded-2xl px-4 py-3"
        >
            <div className="grid grid-cols-4 gap-4">
                {items.map((item, i) => (
                    <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.05 }}
                        className="flex items-center gap-3"
                    >
                        <div className={`p-2 rounded-lg bg-white/[0.04] ${item.color}`}>
                            <item.icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold tabular-nums">{item.value}</p>
                            <p className="text-[10px] text-muted-foreground">{item.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
