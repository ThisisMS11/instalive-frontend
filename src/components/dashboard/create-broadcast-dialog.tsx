"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCreateBroadcast } from "@/services/api";
import { Plus, Radio, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CreateBroadcastDialog() {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [privacy, setPrivacy] = useState("public");
    const [madeForKids, setMadeForKids] = useState(false);

    const createBroadcast = useCreateBroadcast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            toast.error("Title is required");
            return;
        }

        // Schedule for 1 minute from now
        const scheduledStartTime = new Date(Date.now() + 60 * 1000).toISOString();

        createBroadcast.mutate(
            {
                title: title.trim(),
                description: description.trim(),
                scheduledStartTime,
                privacy: privacy,
                madeForKids,
            },
            {
                onSuccess: () => {
                    toast.success("Broadcast created successfully!");
                    setOpen(false);
                    setTitle("");
                    setDescription("");
                    setPrivacy("public");
                    setMadeForKids(false);
                },
                onError: (error) => {
                    toast.error(`Failed to create broadcast: ${error.message}`);
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/20 gap-2">
                    <Plus className="w-4 h-4" />
                    New Broadcast
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-[oklch(0.14_0.005_285)] border-white/[0.08] sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
                            <Radio className="w-4 h-4 text-white" />
                        </div>
                        Create Broadcast
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Set up a new YouTube broadcast. You can go live from the Studio page after creation.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 mt-2">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-medium">
                            Title
                        </Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="My awesome stream"
                            className="glass border-white/[0.08] focus:border-violet-500/40 focus:ring-violet-500/20"
                            maxLength={100}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium">
                            Description
                        </Label>
                        <Input
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What's your stream about?"
                            className="glass border-white/[0.08] focus:border-violet-500/40 focus:ring-violet-500/20"
                            maxLength={500}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Privacy</Label>
                        <Select value={privacy} onValueChange={setPrivacy}>
                            <SelectTrigger className="glass border-white/[0.08]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="glass-strong border-white/[0.08]">
                                <SelectItem value="public">Public</SelectItem>
                                <SelectItem value="unlisted">Unlisted</SelectItem>
                                <SelectItem value="private">Private</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Audience</Label>
                        <Select
                            value={madeForKids ? "yes" : "no"}
                            onValueChange={(v) => setMadeForKids(v === "yes")}
                        >
                            <SelectTrigger className="glass border-white/[0.08]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="glass-strong border-white/[0.08]">
                                <SelectItem value="no">Not made for kids</SelectItem>
                                <SelectItem value="yes">Made for kids</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                            Required by YouTube (COPPA). Select &ldquo;Made for kids&rdquo; if the content is directed at children.
                        </p>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            className="hover:bg-white/[0.04]"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createBroadcast.isPending}
                            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white gap-2"
                        >
                            {createBroadcast.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Radio className="w-4 h-4" />
                            )}
                            Create
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
