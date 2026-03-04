"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Radio, Menu, X } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-50">
            <div className="max-w-6xl mx-auto px-4 pt-4">
                <nav className="glass-strong rounded-2xl px-6 py-3 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="relative">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-shadow">
                                <Radio className="w-4 h-4 text-white" />
                            </div>
                            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-background animate-pulse" />
                        </div>
                        <span className="text-lg font-bold tracking-tight">
                            Insta<span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">Live</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {["Features", "How It Works", "FAQ"].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-white/5"
                            >
                                {item}
                            </a>
                        ))}
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        <SignedOut>
                            <SignInButton mode="modal">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    Sign In
                                </Button>
                            </SignInButton>
                            <SignInButton mode="modal">
                                <Button
                                    size="sm"
                                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0 shadow-lg shadow-violet-600/25 hover:shadow-violet-600/40 transition-all"
                                >
                                    Get Started
                                </Button>
                            </SignInButton>
                        </SignedOut>
                        <SignedIn>
                            <Link href="/dashboard">
                                <Button
                                    size="sm"
                                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0 shadow-lg shadow-violet-600/25"
                                >
                                    Dashboard
                                </Button>
                            </Link>
                            <UserButton
                                afterSignOutUrl="/"
                                appearance={{
                                    elements: {
                                        avatarBox: "w-8 h-8",
                                    },
                                }}
                            />
                        </SignedIn>
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </nav>

                {/* Mobile Menu */}
                {mobileOpen && (
                    <div className="md:hidden mt-2 glass-strong rounded-2xl p-4 space-y-2">
                        {["Features", "How It Works", "FAQ"].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                                onClick={() => setMobileOpen(false)}
                                className="block px-4 py-3 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-white/5 transition-colors"
                            >
                                {item}
                            </a>
                        ))}
                        <div className="pt-2 border-t border-white/10 flex gap-2">
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <Button size="sm" variant="ghost" className="flex-1">
                                        Sign In
                                    </Button>
                                </SignInButton>
                                <SignInButton mode="modal">
                                    <Button
                                        size="sm"
                                        className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0"
                                    >
                                        Get Started
                                    </Button>
                                </SignInButton>
                            </SignedOut>
                            <SignedIn>
                                <Link href="/dashboard" className="flex-1">
                                    <Button size="sm" className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0">
                                        Dashboard
                                    </Button>
                                </Link>
                            </SignedIn>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
