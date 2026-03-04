"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ArrowRight,
    Play,
    Users,
    Shield,
    Sparkles,
} from "lucide-react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import { motion } from "framer-motion";

const stats = [
    { value: "4K", label: "Stream Quality" },
    { value: "30fps", label: "Frame Rate" },
    { value: "<1s", label: "Latency" },
    { value: "24/7", label: "Uptime" },
];

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center pt-28 pb-20 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-dot-grid" />

            {/* Gradient Orbs */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[120px] animate-pulse-glow" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[140px]" />

            {/* Fade edges */}
            <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-background to-transparent z-10" />
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent z-10" />

            <div className="relative z-20 max-w-6xl mx-auto px-4 w-full">
                <div className="max-w-3xl">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Badge
                            variant="secondary"
                            className="mb-6 px-4 py-1.5 text-xs font-medium glass border-violet-500/20 text-violet-300 gap-1.5"
                        >
                            <Sparkles className="w-3 h-3" />
                            AI-Powered Moderation Included
                        </Badge>
                    </motion.div>

                    {/* Heading */}
                    <motion.h1
                        className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        Stream to YouTube{" "}
                        <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                            like a pro.
                        </span>
                    </motion.h1>

                    {/* Description */}
                    <motion.p
                        className="text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        Go live in seconds with real-time overlays, AI chat moderation,
                        viewer analytics, and seamless YouTube integration — all from
                        one beautiful dashboard.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        className="flex flex-col sm:flex-row gap-4 mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <SignedOut>
                            <SignInButton mode="modal">
                                <Button
                                    size="lg"
                                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0 shadow-xl shadow-violet-600/25 hover:shadow-violet-600/40 transition-all text-base px-8 h-12 group"
                                >
                                    Start Streaming Free
                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </SignInButton>
                        </SignedOut>
                        <SignedIn>
                            <Link href="/dashboard">
                                <Button
                                    size="lg"
                                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0 shadow-xl shadow-violet-600/25 hover:shadow-violet-600/40 transition-all text-base px-8 h-12 group"
                                >
                                    Go to Dashboard
                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </SignedIn>
                        <Button
                            size="lg"
                            variant="outline"
                            className="glass border-white/10 hover:bg-white/10 text-base h-12 group"
                        >
                            <Play className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                            Watch Demo
                        </Button>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        className="flex flex-wrap gap-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        {stats.map((stat) => (
                            <div key={stat.label} className="flex flex-col">
                                <span className="text-2xl font-bold bg-gradient-to-r from-violet-300 to-indigo-300 bg-clip-text text-transparent">
                                    {stat.value}
                                </span>
                                <span className="text-xs text-muted-foreground mt-0.5">
                                    {stat.label}
                                </span>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Floating Cards (right side, desktop only) */}
                <div className="hidden lg:block absolute top-1/2 -translate-y-1/2 right-8 space-y-4">
                    {/* Live Indicator Card */}
                    <motion.div
                        className="glass rounded-2xl p-4 w-64 animate-float"
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, delay: 0.6 }}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                            </div>
                            <div>
                                <div className="text-sm font-semibold">Now Streaming</div>
                                <div className="text-xs text-muted-foreground">Gaming with friends</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" /> 1.2K viewers
                            </span>
                            <span>02:34:17</span>
                        </div>
                    </motion.div>

                    {/* Moderation Card */}
                    <motion.div
                        className="glass rounded-2xl p-4 w-56 ml-8 animate-float-delayed"
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, delay: 0.8 }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <div className="text-sm font-semibold">AI Moderation</div>
                                <div className="text-xs text-emerald-400">3 spam blocked</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Viewers Card */}
                    <motion.div
                        className="glass rounded-2xl p-4 w-48 animate-float"
                        style={{ animationDelay: "1s" }}
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, delay: 1.0 }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-violet-400" />
                            </div>
                            <div>
                                <div className="text-sm font-semibold">Overlays</div>
                                <div className="text-xs text-muted-foreground">4 active</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
