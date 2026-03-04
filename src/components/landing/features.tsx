"use client";

import {
    Video,
    Layers,
    MessageSquare,
    Shield,
    BarChart3,
    Zap,
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
    {
        icon: Video,
        title: "One-Click Streaming",
        description:
            "Go live to YouTube in seconds. Our FFmpeg-powered relay handles transcoding, so you just hit broadcast.",
        gradient: "from-rose-500 to-orange-500",
        glow: "shadow-rose-500/20",
        size: "large",
    },
    {
        icon: Layers,
        title: "Custom Overlays",
        description:
            "Upload overlay images and switch them mid-stream without interruption. Brand your stream your way.",
        gradient: "from-violet-500 to-purple-500",
        glow: "shadow-violet-500/20",
        size: "medium",
    },
    {
        icon: MessageSquare,
        title: "Live Chat",
        description:
            "Read and respond to your YouTube chat in real-time. Block trolls with a single click.",
        gradient: "from-blue-500 to-cyan-500",
        glow: "shadow-blue-500/20",
        size: "medium",
    },
    {
        icon: Shield,
        title: "AI Moderation",
        description:
            "Gemini AI auto-detects spam, phishing, and harassment with a strike-based ban system.",
        gradient: "from-emerald-500 to-teal-500",
        glow: "shadow-emerald-500/20",
        size: "medium",
    },
    {
        icon: BarChart3,
        title: "Live Analytics",
        description:
            "Real-time viewer count, chat rate, and stream health — all at a glance.",
        gradient: "from-amber-500 to-yellow-500",
        glow: "shadow-amber-500/20",
        size: "medium",
    },
    {
        icon: Zap,
        title: "Secure & Fast",
        description:
            "JWT auth, encrypted stream keys, and your RTMP URL never leaves the server.",
        gradient: "from-indigo-500 to-blue-500",
        glow: "shadow-indigo-500/20",
        size: "medium",
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" as const },
    },
};

export default function Features() {
    return (
        <section id="features" className="py-24 relative">
            <div className="max-w-6xl mx-auto px-4">
                {/* Section Header */}
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                        Everything you need to{" "}
                        <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                            go live
                        </span>
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                        Professional streaming tools, AI moderation, and real-time analytics
                        — built for creators who want more control.
                    </p>
                </motion.div>

                {/* Bento Grid */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    {/* Large Card (takes 2 cols) */}
                    {(() => {
                        const Icon0 = features[0].icon;
                        return (
                            <motion.div
                                variants={itemVariants}
                                className="md:col-span-2 lg:col-span-2 group"
                            >
                                <div className="glass rounded-2xl p-8 h-full hover:bg-white/[0.06] transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                                    {/* Background glow */}
                                    <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${features[0].gradient} opacity-[0.06] rounded-full blur-3xl group-hover:opacity-[0.1] transition-opacity`} />

                                    <div className="relative z-10">
                                        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${features[0].gradient} shadow-lg ${features[0].glow} mb-5`}>
                                            <Icon0 className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-2xl font-semibold mb-3">
                                            {features[0].title}
                                        </h3>
                                        <p className="text-muted-foreground leading-relaxed max-w-md">
                                            {features[0].description}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })()}

                    {/* Medium Card */}
                    {(() => {
                        const Icon1 = features[1].icon;
                        return (
                            <motion.div variants={itemVariants} className="group">
                                <div className="glass rounded-2xl p-8 h-full hover:bg-white/[0.06] transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                                    <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${features[1].gradient} opacity-[0.06] rounded-full blur-3xl group-hover:opacity-[0.1] transition-opacity`} />

                                    <div className="relative z-10">
                                        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${features[1].gradient} shadow-lg ${features[1].glow} mb-5`}>
                                            <Icon1 className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-3">
                                            {features[1].title}
                                        </h3>
                                        <p className="text-muted-foreground leading-relaxed text-sm">
                                            {features[1].description}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })()}

                    {/* Remaining cards */}
                    {features.slice(2).map((feature) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div key={feature.title} variants={itemVariants} className="group">
                                <div className="glass rounded-2xl p-8 h-full hover:bg-white/[0.06] transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                                    <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${feature.gradient} opacity-[0.06] rounded-full blur-3xl group-hover:opacity-[0.1] transition-opacity`} />

                                    <div className="relative z-10">
                                        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg ${feature.glow} mb-5`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                                        <p className="text-muted-foreground leading-relaxed text-sm">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}
