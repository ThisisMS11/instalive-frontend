"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

const faqs = [
    {
        question: "What platforms does InstaLive support?",
        answer:
            "InstaLive currently supports YouTube Live streaming. We handle everything from broadcast creation to RTMP relay, so you can focus on your content.",
    },
    {
        question: "How does the AI moderation work?",
        answer:
            "Our moderation uses Google's Gemini AI to analyze chat messages in real-time. It detects spam, phishing, harassment, and excessive repetition with a confidence-scored classification. A strike-based system automatically warns and bans repeat offenders.",
    },
    {
        question: "Is my stream key secure?",
        answer:
            "Absolutely. Your RTMP stream key never leaves our server. The frontend only sends your JWT authentication token — the backend resolves the stream URL from your database record. This is a major security improvement over exposing stream keys in the browser.",
    },
    {
        question: "Can I use custom overlays?",
        answer:
            "Yes! Upload PNG overlay images through the studio interface. You can switch overlays mid-stream — the Go backend restarts the FFmpeg process with the new overlay filter in under 2 seconds.",
    },
    {
        question: "What video quality does InstaLive support?",
        answer:
            "We stream at 4500kbps video bitrate with H.264 encoding at 30fps, AAC audio at 128kbps. The veryfast preset with zerolatency tuning ensures low-latency output optimized for live streaming.",
    },
    {
        question: "Do I need to install FFmpeg?",
        answer:
            "FFmpeg runs on the server side, not on your machine. Our Go backend manages FFmpeg subprocesses for each stream session. You just need a browser with webcam access.",
    },
];

export default function Faq() {
    return (
        <section id="faq" className="py-24 relative">
            <div className="max-w-3xl mx-auto px-4">
                {/* Section Header */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                        Frequently{" "}
                        <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                            asked
                        </span>
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Everything you need to know about InstaLive.
                    </p>
                </motion.div>

                {/* FAQ Accordion */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <Accordion type="single" collapsible className="space-y-3">
                        {faqs.map((faq, index) => (
                            <AccordionItem
                                key={index}
                                value={`item-${index}`}
                                className="glass rounded-xl px-6 border-0"
                            >
                                <AccordionTrigger className="text-left text-sm sm:text-base font-medium hover:no-underline py-5 text-foreground/90 hover:text-foreground transition-colors">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-5">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </motion.div>
            </div>
        </section>
    );
}
