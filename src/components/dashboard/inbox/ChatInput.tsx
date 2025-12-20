
import { useState, KeyboardEvent } from "react";
import { Send, Loader2, Sparkles, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
    onSend: (message: string) => Promise<void>;
    disabled?: boolean;
    customerId?: number;
}

export default function ChatInput({ onSend, disabled, customerId }: ChatInputProps) {
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [generatingAI, setGeneratingAI] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);

    // Mock templates for now - ideally fetch from API
    const templates = [
        "Hi! Thanks for your order. We're processing it now.",
        "Your order has been shipped! Here is your tracking number.",
        "Hi! Could you please confirm your delivery address?",
        "Thanks for contacting us. How can I help you today?"
    ];

    const handleSend = async () => {
        if (!message.trim() || sending || disabled) return;

        setSending(true);
        try {
            await onSend(message);
            setMessage("");
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleAISuggest = async () => {
        if (!customerId || generatingAI) return;

        setGeneratingAI(true);
        try {
            const res = await fetch('/api/inbox/suggest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customerId })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.suggestion) {
                    setMessage(data.suggestion);
                }
            }
        } catch (error) {
            console.error("Failed to generate suggestion", error);
        } finally {
            setGeneratingAI(false);
        }
    };

    return (
        <div className="p-4 bg-white border-t border-gray-200 relative">
            {/* Templates Popover */}
            {showTemplates && (
                <div className="absolute bottom-full left-4 mb-2 w-72 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-20">
                    <div className="p-2 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                        <span className="text-xs font-semibold text-gray-500">Quick Replies</span>
                        <button onClick={() => setShowTemplates(false)} className="text-gray-400 hover:text-gray-600">
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                        {templates.map((t, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    setMessage(t);
                                    setShowTemplates(false);
                                }}
                                className="w-full text-left p-2 hover:bg-indigo-50 text-sm text-gray-700 truncate border-b border-gray-100 last:border-0"
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex items-end gap-2">
                {/* Tools */}
                <div className="flex gap-1 pb-1">
                    <button
                        onClick={handleAISuggest}
                        disabled={generatingAI || !customerId}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                        title="Generate AI Reply"
                        aria-label="Generate AI Reply"
                    >
                        {generatingAI ? <Loader2 className="w-5 h-5 animate-spin text-indigo-600" /> : <Sparkles className="w-5 h-5 text-indigo-600" />}
                    </button>
                    <button
                        onClick={() => setShowTemplates(!showTemplates)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        title="Insert Template"
                        aria-label="Insert Template"
                    >
                        <FileText className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <textarea
                    className="flex-1 min-h-[44px] max-h-32 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={disabled || sending}
                    rows={1}
                />
                <button
                    onClick={handleSend}
                    disabled={!message.trim() || sending || disabled}
                    className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {sending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Send className="w-5 h-5" />
                    )}
                </button>
            </div>
        </div>
    );
}

