"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Loader2, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatMessages, usePostChatMessage } from "@/services/api";
import { useState } from "react";

interface ChatPanelProps {
    liveChatId?: string;
    streamerChannelId?: string;
}

export default function ChatPanel({ liveChatId, streamerChannelId }: ChatPanelProps) {
    const { data: messagesData, isLoading } = useChatMessages(liveChatId);
    const postMessage = usePostChatMessage();
    const [message, setMessage] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    const messages = messagesData?.data ?? [];

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages.length]);

    const handleSend = () => {
        if (!message.trim() || !liveChatId) return;
        postMessage.mutate(
            { liveChatId, messageText: message.trim() },
            { onSuccess: () => setMessage("") }
        );
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="glass rounded-2xl flex flex-col h-full overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                <MessageCircle className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-medium">Live Chat</span>
                {messages.length > 0 && (
                    <span className="ml-auto text-xs text-muted-foreground bg-white/[0.06] px-2 py-0.5 rounded-full">
                        {messages.length}
                    </span>
                )}
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                        <MessageCircle className="w-8 h-8 opacity-30" />
                        <p className="text-xs">No messages yet</p>
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {messages.map((msg, i) => {
                            const isStreamer = streamerChannelId
                                ? msg.authorChannelId === streamerChannelId
                                : false;

                            return (
                                <motion.div
                                    key={msg.id || i}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.15 }}
                                    className={`group flex items-start gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.03] transition-colors ${isStreamer
                                            ? "bg-violet-500/[0.06] border border-violet-500/15"
                                            : ""
                                        }`}
                                >
                                    {/* Profile image */}
                                    <Avatar className="w-6 h-6 shrink-0 mt-0.5">
                                        <AvatarImage src={msg.profileImage} />
                                        <AvatarFallback className="text-[10px] bg-white/[0.06]">
                                            {msg.channelName?.[0] || "?"}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="min-w-0 flex-1">
                                        <span className="inline-flex items-center gap-1">
                                            <span
                                                className={`text-xs font-medium truncate ${isStreamer
                                                        ? "text-violet-300"
                                                        : "text-zinc-400"
                                                    }`}
                                            >
                                                {msg.channelName}
                                            </span>
                                            {isStreamer && (
                                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-violet-500/20 border border-violet-500/30">
                                                    <ShieldCheck className="w-2.5 h-2.5 text-violet-400" />
                                                    <span className="text-[9px] font-semibold text-violet-300 uppercase tracking-wider">
                                                        Streamer
                                                    </span>
                                                </span>
                                            )}
                                        </span>
                                        <p className="text-xs text-zinc-300 break-words leading-relaxed">
                                            {msg.messageContent}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}
            </div>

            {/* Input */}
            <div className="px-3 py-3 border-t border-white/[0.06]">
                <div className="flex gap-2">
                    <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Send a message..."
                        className="flex-1 h-9 text-xs bg-white/[0.04] border-white/[0.08] placeholder:text-muted-foreground/50 focus-visible:ring-violet-500/30"
                    />
                    <Button
                        size="icon"
                        onClick={handleSend}
                        disabled={!message.trim() || postMessage.isPending}
                        className="h-9 w-9 rounded-lg bg-violet-600 hover:bg-violet-500 shrink-0"
                    >
                        {postMessage.isPending ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <Send className="w-3.5 h-3.5" />
                        )}
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
