"use client";

import { Radio, Github, Twitter } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

const footerLinks = [
    {
        title: "Product",
        links: [
            { label: "Features", href: "#features" },
            { label: "How It Works", href: "#how-it-works" },
            { label: "FAQ", href: "#faq" },
        ],
    },
    {
        title: "Company",
        links: [
            { label: "About", href: "#" },
            { label: "Privacy", href: "/privacy" },
            { label: "Terms", href: "/terms" },
        ],
    },
];

export default function Footer() {
    return (
        <footer className="relative pt-20 pb-8">
            {/* Top glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

            <div className="max-w-6xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <Link href="/" className="flex items-center gap-2.5 mb-4 group">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                                <Radio className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-lg font-bold tracking-tight">
                                Insta<span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">Live</span>
                            </span>
                        </Link>
                        <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-6">
                            Professional YouTube Live streaming with AI moderation,
                            custom overlays, and real-time analytics. Built by creators,
                            for creators.
                        </p>
                        <div className="flex gap-3">
                            <a
                                href="#"
                                className="w-9 h-9 rounded-lg glass flex items-center justify-center hover:bg-white/10 transition-colors"
                                aria-label="GitHub"
                            >
                                <Github className="w-4 h-4 text-muted-foreground" />
                            </a>
                            <a
                                href="#"
                                className="w-9 h-9 rounded-lg glass flex items-center justify-center hover:bg-white/10 transition-colors"
                                aria-label="Twitter"
                            >
                                <Twitter className="w-4 h-4 text-muted-foreground" />
                            </a>
                        </div>
                    </div>

                    {/* Link columns */}
                    {footerLinks.map((group) => (
                        <div key={group.title}>
                            <h4 className="text-sm font-semibold mb-4">{group.title}</h4>
                            <ul className="space-y-3">
                                {group.links.map((link) => (
                                    <li key={link.label}>
                                        <a
                                            href={link.href}
                                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <Separator className="bg-white/[0.06] mb-8" />

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                    <span>© 2026 InstaLive. All rights reserved.</span>
                    <span>
                        Built with ❤️ using Go, Next.js &amp; FFmpeg
                    </span>
                </div>
            </div>
        </footer>
    );
}
