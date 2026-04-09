"use client";

import { motion } from "framer-motion";
import { Layers, Upload, Check, Loader2, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useOverlays, useUploadOverlay, useDeleteOverlay } from "@/services/api";
import { useRef } from "react";
import Image from "next/image";
import { toast } from "sonner";
import type { Overlay } from "@/types";

interface OverlayPanelProps {
    activeOverlayUrl?: string;
    onSelectOverlay: (url: string | undefined) => void;
}

export default function OverlayPanel({ activeOverlayUrl, onSelectOverlay }: OverlayPanelProps) {
    const { data: overlaysData, isLoading } = useOverlays();
    const uploadOverlay = useUploadOverlay();
    const deleteOverlay = useDeleteOverlay();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const overlays: Overlay[] = overlaysData?.data ?? [];

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("overlay", file);
        formData.append("name", file.name);
        uploadOverlay.mutate(formData, {
            onSuccess: () => toast.success("Overlay uploaded successfully"),
            onError: (err) => toast.error(`Upload failed: ${err.message}`),
        });
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="glass rounded-2xl flex flex-col h-full overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm font-medium">Overlays</span>
                </div>
                <div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleUpload}
                        className="hidden"
                    />
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadOverlay.isPending}
                        className="h-7 text-xs gap-1 text-muted-foreground hover:text-white"
                    >
                        {uploadOverlay.isPending ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                            <Upload className="w-3 h-3" />
                        )}
                        Upload
                    </Button>
                </div>
            </div>

            {/* Remove active overlay */}
            {activeOverlayUrl && (
                <div className="px-4 py-2 border-b border-white/[0.06]">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelectOverlay(undefined)}
                        className="w-full h-7 text-xs gap-1 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                    >
                        <X className="w-3 h-3" />
                        Remove Overlay
                    </Button>
                </div>
            )}

            {/* Grid */}
            <ScrollArea className="flex-1 p-3">
                {isLoading ? (
                    <div className="flex items-center justify-center h-32">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                ) : overlays.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 gap-2 text-muted-foreground">
                        <Layers className="w-8 h-8 opacity-30" />
                        <p className="text-xs">No overlays yet</p>
                        <p className="text-[10px] text-center opacity-60">Upload an image to use as a stream overlay</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2">
                        {overlays.map((overlay, i) => {
                            const isActive = activeOverlayUrl === overlay.url;
                            return (
                                <motion.div
                                    key={overlay.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => onSelectOverlay(isActive ? undefined : overlay.url)}
                                    className={`group cursor-pointer relative aspect-video rounded-xl overflow-hidden border-2 transition-all hover:scale-[1.02] ${isActive
                                        ? "border-violet-500 ring-2 ring-violet-500/30"
                                        : "border-white/[0.06] hover:border-white/[0.12]"
                                        }`}
                                >
                                    <Image
                                        src={overlay.url}
                                        alt={overlay.description || "Overlay"}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                    {isActive && (
                                        <div className="absolute inset-0 bg-violet-500/20 flex items-center justify-center">
                                            <div className="p-1.5 rounded-full bg-violet-500 shadow-lg">
                                                <Check className="w-4 h-4 text-white" />
                                            </div>
                                        </div>
                                    )}
                                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="h-6 w-6 rounded-full shadow-md"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (isActive) onSelectOverlay(undefined);
                                                deleteOverlay.mutate(overlay.id, {
                                                    onError: (err) => toast.error(`Delete failed: ${err.message}`),
                                                });
                                            }}
                                            disabled={deleteOverlay.isPending}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 text-[10px] truncate text-center backdrop-blur-sm">
                                        {overlay.description || "Untitled"}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </ScrollArea>
        </motion.div>
    );
}
