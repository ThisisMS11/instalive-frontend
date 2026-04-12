"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Shield,
    Eye,
    Baby,
    Loader2,
    CheckCircle,
    ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useBroadcastSettings, useUpdateBroadcastSettings } from "@/services/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Collapsible settings section ───────────────────────
function SettingsSection({
    title,
    icon: Icon,
    children,
    defaultOpen = true,
}: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="rounded-xl border border-white/[0.06] overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
            >
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-white/[0.04]">
                        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium">{title}</span>
                </div>
                <ChevronDown
                    className={cn(
                        "w-4 h-4 text-muted-foreground transition-transform duration-200",
                        open && "rotate-180"
                    )}
                />
            </button>

            {open && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18 }}
                    className="border-t border-white/[0.06]"
                >
                    <div className="p-4 space-y-4">{children}</div>
                </motion.div>
            )}
        </div>
    );
}

// ─── Setting row ─────────────────────────────────────────
function SettingRow({
    label,
    description,
    icon: Icon,
    children,
}: {
    label: string;
    description?: string;
    icon: React.ElementType;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Icon className="w-3 h-3" />
                {label}
            </label>
            {children}
            {description && (
                <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
                    {description}
                </p>
            )}
        </div>
    );
}

// ─── Main panel ──────────────────────────────────────────
export default function BroadcastSettingsPanel({
    broadcastId,
}: {
    broadcastId: string;
}) {
    const { data, isLoading } = useBroadcastSettings(broadcastId);
    const updateSettings = useUpdateBroadcastSettings();

    const settings = data?.data;

    const [privacy, setPrivacy] = useState("public");
    const [madeForKids, setMadeForKids] = useState(false);
    const [dirty, setDirty] = useState(false);

    // Populate form once settings load from YouTube
    useEffect(() => {
        if (settings) {
            setPrivacy(settings.privacyStatus);
            setMadeForKids(settings.madeForKids);
            setDirty(false);
        }
    }, [settings]);

    const handleChange = <T,>(setter: (v: T) => void) => (v: T) => {
        setter(v);
        setDirty(true);
    };

    const handleApply = () => {
        updateSettings.mutate(
            { broadcastId, privacyStatus: privacy, madeForKids },
            {
                onSuccess: () => {
                    toast.success("Stream settings updated");
                    setDirty(false);
                },
                onError: (err) =>
                    toast.error(`Failed to update settings: ${err.message}`),
            }
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div
            className="h-full overflow-y-auto space-y-3 pr-1
                [&::-webkit-scrollbar]:w-1.5
                [&::-webkit-scrollbar-track]:bg-transparent
                [&::-webkit-scrollbar-thumb]:bg-white/[0.08]
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-thumb:hover]:bg-white/[0.15]"
        >
            {/* ── Audience & Privacy ─────────────────────── */}
            <SettingsSection title="Audience & Privacy" icon={Shield}>
                <SettingRow
                    label="Visibility"
                    icon={Eye}
                    description="Changes take effect immediately on YouTube."
                >
                    <Select
                        value={privacy}
                        onValueChange={handleChange(setPrivacy)}
                    >
                        <SelectTrigger className="glass border-white/[0.08] h-9 text-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-strong border-white/[0.08]">
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="unlisted">Unlisted</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                    </Select>
                </SettingRow>

                <Separator className="bg-white/[0.04]" />

                <SettingRow
                    label="Audience (COPPA)"
                    icon={Baby}
                    description="Required by YouTube. Select 'Made for kids' only if your content is directed at children."
                >
                    <Select
                        value={madeForKids ? "yes" : "no"}
                        onValueChange={(v) =>
                            handleChange(setMadeForKids)(v === "yes")
                        }
                    >
                        <SelectTrigger className="glass border-white/[0.08] h-9 text-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-strong border-white/[0.08]">
                            <SelectItem value="no">Not made for kids</SelectItem>
                            <SelectItem value="yes">Made for kids</SelectItem>
                        </SelectContent>
                    </Select>
                </SettingRow>

                <Button
                    size="sm"
                    onClick={handleApply}
                    disabled={!dirty || updateSettings.isPending}
                    className={cn(
                        "w-full gap-1.5 transition-all",
                        dirty
                            ? "bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 border border-violet-500/20"
                            : "bg-white/[0.03] text-muted-foreground border border-white/[0.06] cursor-default"
                    )}
                >
                    {updateSettings.isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                        <CheckCircle className="w-3.5 h-3.5" />
                    )}
                    {dirty ? "Apply Changes" : "No Pending Changes"}
                </Button>
            </SettingsSection>

            {/*
             * ── Future sections ──────────────────────────
             * Add more <SettingsSection> blocks here as needed, e.g.:
             *   <SettingsSection title="Stream Quality" icon={Zap}>...</SettingsSection>
             *   <SettingsSection title="Chat Settings" icon={MessageSquare}>...</SettingsSection>
             */}
        </div>
    );
}
