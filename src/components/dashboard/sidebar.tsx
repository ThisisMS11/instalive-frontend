"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
    Radio,
    LayoutDashboard,
    Tv,
    Settings,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/studio", icon: Tv, label: "Studio" },
    { href: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <TooltipProvider delayDuration={0}>
            <aside
                className={cn(
                    "fixed top-0 left-0 z-40 h-screen flex flex-col border-r border-white/[0.06] bg-[oklch(0.11_0.005_285)] transition-all duration-300",
                    collapsed ? "w-[68px]" : "w-[220px]"
                )}
            >
                {/* Logo */}
                <div className={cn("flex items-center gap-2.5 px-4 h-16 shrink-0", collapsed && "justify-center")}>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
                        <Radio className="w-4 h-4 text-white" />
                    </div>
                    {!collapsed && (
                        <span className="text-lg font-bold tracking-tight overflow-hidden whitespace-nowrap">
                            Insta<span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">Live</span>
                        </span>
                    )}
                </div>

                {/* Nav Links */}
                <nav className="flex-1 px-2 py-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                        const Icon = item.icon;

                        const link = (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-violet-500/15 text-violet-300 shadow-sm shadow-violet-500/10"
                                        : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]",
                                    collapsed && "justify-center px-0"
                                )}
                            >
                                <Icon className="w-[18px] h-[18px] shrink-0" />
                                {!collapsed && <span>{item.label}</span>}
                            </Link>
                        );

                        return collapsed ? (
                            <Tooltip key={item.href}>
                                <TooltipTrigger asChild>{link}</TooltipTrigger>
                                <TooltipContent side="right" className="glass">
                                    {item.label}
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            link
                        );
                    })}
                </nav>

                {/* Bottom Section */}
                <div className={cn("border-t border-white/[0.06] px-3 py-3 flex items-center", collapsed ? "justify-center" : "justify-between")}>
                    <UserButton
                        appearance={{
                            elements: {
                                avatarBox: "w-8 h-8",
                            },
                        }}
                    />
                    {!collapsed && (
                        <button
                            onClick={() => setCollapsed(true)}
                            className="p-1.5 rounded-lg hover:bg-white/[0.06] text-muted-foreground transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Collapse toggle (when collapsed) */}
                {collapsed && (
                    <button
                        onClick={() => setCollapsed(false)}
                        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[oklch(0.15_0.01_285)] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.06] transition-colors"
                    >
                        <ChevronRight className="w-3 h-3 text-muted-foreground" />
                    </button>
                )}
            </aside>
        </TooltipProvider>
    );
}
