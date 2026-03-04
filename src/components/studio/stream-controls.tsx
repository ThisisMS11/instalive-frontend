"use client";

import { motion } from "framer-motion";
import {
    Video,
    VideoOff,
    Mic,
    MicOff,
    StopCircle,
    Copy,
    Check,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import { useState } from "react";

interface StreamControlsProps {
    isStreaming: boolean;
    isVideoOn: boolean;
    isAudioOn: boolean;
    broadcastYoutubeId: string;
    onToggleVideo: () => void;
    onToggleAudio: () => void;
    onStopStream: () => void;
    isStopping: boolean;
}

export default function StreamControls({
    isStreaming,
    isVideoOn,
    isAudioOn,
    broadcastYoutubeId,
    onToggleVideo,
    onToggleAudio,
    onStopStream,
    isStopping,
}: StreamControlsProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(
            `https://www.youtube.com/watch?v=${broadcastYoutubeId}`
        );
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex items-center justify-center gap-3 py-3"
        >
            {/* Video toggle */}
            <Button
                variant="ghost"
                size="icon"
                onClick={onToggleVideo}
                className={`rounded-xl w-11 h-11 transition-all ${isVideoOn
                        ? "bg-white/[0.06] hover:bg-white/[0.1] text-white"
                        : "bg-red-500/20 hover:bg-red-500/30 text-red-400"
                    }`}
            >
                {isVideoOn ? <Video className="w-4.5 h-4.5" /> : <VideoOff className="w-4.5 h-4.5" />}
            </Button>

            {/* Audio toggle */}
            <Button
                variant="ghost"
                size="icon"
                onClick={onToggleAudio}
                className={`rounded-xl w-11 h-11 transition-all ${isAudioOn
                        ? "bg-white/[0.06] hover:bg-white/[0.1] text-white"
                        : "bg-red-500/20 hover:bg-red-500/30 text-red-400"
                    }`}
            >
                {isAudioOn ? <Mic className="w-4.5 h-4.5" /> : <MicOff className="w-4.5 h-4.5" />}
            </Button>

            {/* Copy URL */}
            <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="rounded-xl w-11 h-11 bg-white/[0.06] hover:bg-white/[0.1]"
            >
                {copied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                    <Copy className="w-4 h-4" />
                )}
            </Button>

            {/* Stop Stream */}
            {isStreaming && (
                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-xl w-11 h-11 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300"
                        >
                            <StopCircle className="w-5 h-5" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[oklch(0.14_0.005_285)] border-white/[0.08] sm:max-w-[420px]">
                        <DialogHeader>
                            <DialogTitle className="text-lg">End Stream?</DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                                This will stop your live broadcast and end the streaming session. This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <DialogClose asChild>
                                <Button variant="ghost" className="text-muted-foreground">
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button
                                onClick={onStopStream}
                                disabled={isStopping}
                                className="bg-red-500 hover:bg-red-600 text-white gap-2"
                            >
                                {isStopping ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <StopCircle className="w-4 h-4" />
                                )}
                                End Stream
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </motion.div>
    );
}
