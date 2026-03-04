"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShieldBan, UserX, Loader2, Undo2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useBlockedUsers, useUnblockUser } from "@/services/api";

export default function BlockedUsersPanel() {
    const { data: blockedData, isLoading } = useBlockedUsers();
    const unblockUser = useUnblockUser();

    const blockedUsers = blockedData?.data ?? [];

    return (
        <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="glass rounded-2xl flex flex-col h-full overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                <ShieldBan className="w-4 h-4 text-red-400" />
                <span className="text-sm font-medium">Blocked Users</span>
                {blockedUsers.length > 0 && (
                    <span className="ml-auto text-xs text-muted-foreground bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full">
                        {blockedUsers.length}
                    </span>
                )}
            </div>

            {/* List */}
            <ScrollArea className="flex-1 p-3">
                {isLoading ? (
                    <div className="flex items-center justify-center h-24">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                ) : blockedUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-24 gap-2 text-muted-foreground">
                        <ShieldBan className="w-8 h-8 opacity-20" />
                        <p className="text-xs">No blocked users</p>
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        <div className="space-y-1">
                            {blockedUsers.map((user, i) => (
                                <motion.div
                                    key={user.id}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 8 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="group flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/[0.03] transition-colors"
                                >
                                    <Avatar className="w-7 h-7 shrink-0">
                                        <AvatarImage src={user.profileImage} />
                                        <AvatarFallback className="text-[10px] bg-white/[0.06]">
                                            {user.channelName?.[0] || "?"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium truncate">{user.channelName}</p>
                                        <p className="text-[10px] text-muted-foreground truncate">{user.messageContent}</p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            unblockUser.mutate({ banId: user.banId })
                                        }
                                        disabled={unblockUser.isPending}
                                        className="opacity-0 group-hover:opacity-100 h-7 w-7 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-400 transition-all"
                                    >
                                        <Undo2 className="w-3 h-3" />
                                    </Button>
                                </motion.div>
                            ))}
                        </div>
                    </AnimatePresence>
                )}
            </ScrollArea>
        </motion.div>
    );
}
