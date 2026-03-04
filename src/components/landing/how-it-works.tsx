"use client";

import { motion } from "framer-motion";
import { Youtube, Tv, Radio } from "lucide-react";

const steps = [
    {
        number: "01",
        icon: Youtube,
        title: "Connect YouTube",
        description: "Link your YouTube account with one click via Google OAuth. We securely store your credentials.",
        gradient: "from-red-500 to-rose-500",
    },
    {
        number: "02",
        icon: Tv,
        title: "Create Broadcast",
        description: "Set your title, description, and schedule. We create the YouTube broadcast and stream for you.",
        gradient: "from-violet-500 to-purple-500",
    },
    {
        number: "03",
        icon: Radio,
        title: "Go Live",
        description: "Hit broadcast. Your webcam feeds through our FFmpeg relay to YouTube's RTMP servers in real-time.",
        gradient: "from-emerald-500 to-teal-500",
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15 },
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

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24 relative">
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
                        Live in{" "}
                        <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                            three steps
                        </span>
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-lg mx-auto">
                        From zero to streaming in under two minutes.
                    </p>
                </motion.div>

                {/* Steps */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <motion.div key={step.number} variants={itemVariants} className="relative group">
                                {/* Connector line (desktop) */}
                                {index < steps.length - 1 && (
                                    <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-white/10 to-transparent z-0" />
                                )}

                                <div className="glass rounded-2xl p-8 hover:bg-white/[0.06] transition-all duration-300 hover:-translate-y-1 relative overflow-hidden h-full">
                                    {/* Background glow */}
                                    <div className={`absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br ${step.gradient} opacity-[0.08] rounded-full blur-2xl group-hover:opacity-[0.15] transition-opacity`} />

                                    <div className="relative z-10">
                                        {/* Step number */}
                                        <div className="text-5xl font-black text-white/[0.06] mb-4 select-none">
                                            {step.number}
                                        </div>

                                        {/* Icon */}
                                        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${step.gradient} shadow-lg mb-5`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>

                                        <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed">
                                            {step.description}
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
