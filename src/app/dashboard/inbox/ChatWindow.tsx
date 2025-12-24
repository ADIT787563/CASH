'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Send, Phone, MoreVertical, Paperclip, Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sendMessage } from '@/app/actions/inbox';

interface Message {
    id: number;
    content: string;
    direction: string; // 'inbound' | 'outbound'
    timestamp: string;
    status: string;
}

interface ChatWindowProps {
    leadId: number;
    leadName: string;
    initialMessages: Message[];
    onSendMessage: () => void; // Trigger refresh
}

export default function ChatWindow({ leadId, leadName, initialMessages, onSendMessage }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [inputValue, setInputValue] = useState('');
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Update messages when initialMessages prop changes (e.g. parent re-fetch)
    useEffect(() => {
        setMessages(initialMessages);
    }, [initialMessages]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!inputValue.trim() || isSending) return;

        const content = inputValue;
        setInputValue('');
        setIsSending(true);

        try {
            // Optimistic update
            const tempId = Date.now();
            const optimisticMsg: Message = {
                id: tempId,
                content: content,
                direction: 'outbound',
                timestamp: new Date().toISOString(),
                status: 'sending'
            };
            setMessages(prev => [...prev, optimisticMsg]);

            await sendMessage(leadId, content);
            onSendMessage(); // Tell parent to refresh logic if needed
        } catch (error) {
            console.error("Failed to send", error);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-zinc-50/50">
            {/* Header */}
            <div className="h-16 border-b border-zinc-200 flex items-center justify-between px-6 bg-white shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium shadow-sm">
                        {leadName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="font-bold text-zinc-900">{leadName}</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs text-zinc-500 font-medium">Online</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500 hover:text-zinc-900 transition-colors" aria-label="Call Contact">
                        <Phone className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500 hover:text-zinc-900 transition-colors" aria-label="More Options">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50"
            >
                {messages.map((msg) => {
                    const isOutbound = msg.direction === 'outbound';

                    // --- RICH MESSAGE: ORDER CONFIRMED ---
                    if (msg.content.includes("Order Confirmed!")) {
                        return (
                            <div key={msg.id} className="flex w-full mb-6 justify-start">
                                <div className="max-w-[85%] sm:max-w-[320px] bg-white text-zinc-900 rounded-lg rounded-tl-none overflow-hidden shadow-sm border border-zinc-200">
                                    {/* Header */}
                                    <div className="p-3 border-b border-zinc-100 flex items-center gap-2 bg-zinc-50/50">
                                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs">
                                            <Check className="w-3 h-3" />
                                        </div>
                                        <span className="font-semibold text-sm">Order Confirmed! 🎉</span>
                                    </div>
                                    {/* Body */}
                                    <div className="p-3">
                                        <p className="text-sm text-zinc-600 leading-snug mb-3">
                                            Your order #12345 for Party Wear Maxi Dress (Size L) is confirmed.
                                        </p>
                                        <div className="bg-zinc-50 border border-zinc-200 p-2 rounded flex gap-3">
                                            <div className="w-12 h-16 bg-zinc-200 rounded shrink-0 overflow-hidden relative">
                                                {/* Placeholder Image */}
                                                <img src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=150&q=80" alt="Product" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-xs font-semibold text-zinc-900 truncate">Party Wear Maxi Dress</h4>
                                                <p className="text-[10px] text-zinc-500 mb-1">Black, L • Qty: 1</p>
                                                <p className="text-sm font-bold text-zinc-900">₹ 2,299</p>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Footer */}
                                    <div className="p-2 bg-zinc-50 border-t border-zinc-100 flex justify-between items-center">
                                        <span className="text-[10px] text-zinc-400">10:21 AM</span>
                                        <button className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-100 hover:bg-emerald-100 transition-colors">
                                            Track Order
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    // --- RICH MESSAGE: PAYMENT RECEIVED ---
                    if (msg.content.includes("Payment Received")) {
                        return (
                            <div key={msg.id} className="flex w-full mb-6 justify-start">
                                <div className="max-w-[85%] sm:max-w-[300px] bg-emerald-50 border border-emerald-100 rounded-2xl rounded-tl-none p-4 shadow-sm relative">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-sm shrink-0">
                                            <CheckCheck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-emerald-900 text-sm">Payment Received</h4>
                                            <p className="text-[10px] text-emerald-700">Payment of ₹2,299 received via Razorpay.</p>
                                        </div>
                                    </div>
                                    <span className="absolute bottom-2 right-3 text-[10px] text-emerald-600/60 font-medium">10:21 AM</span>
                                </div>
                            </div>
                        );
                    }

                    // --- STANDARD MESSAGE ---
                    return (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex w-full mb-4",
                                isOutbound ? "justify-end" : "justify-start"
                            )}
                        >
                            <div className={cn(
                                "max-w-[70%] rounded-2xl p-4 shadow-sm relative group",
                                isOutbound
                                    ? "bg-indigo-600 text-white rounded-br-none shadow-indigo-100"
                                    : "bg-white text-zinc-900 rounded-bl-none border border-zinc-200"
                            )}>
                                <p className="text-sm leading-relaxed">{msg.content}</p>
                                <div className={cn(
                                    "text-[10px] mt-1 flex items-center gap-1",
                                    isOutbound ? "text-indigo-200 justify-end" : "text-zinc-400"
                                )}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {isOutbound && (
                                        <span>
                                            {msg.status === 'read' ? <CheckCheck className="w-3 h-3 text-indigo-200" /> : <Check className="w-3 h-3 text-indigo-200" />}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="px-6 py-2 bg-white border-t border-zinc-200 shrink-0 flex items-center gap-2 overflow-x-auto custom-scrollbar">
                <button
                    onClick={() => setInputValue("Here is our latest catalog: https://store.wavegroww.com/catalog")}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 whitespace-nowrap transition-colors"
                >
                    Send Catalog 🛍️
                </button>
                <button
                    onClick={() => setInputValue("Please complete your payment of ₹1,499 via UPI to confirm your order.")}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 whitespace-nowrap transition-colors"
                >
                    Request Payment 💳
                </button>
                <button
                    onClick={() => setInputValue("Your order #12345 has been confirmed! We will ship it within 24 hours.")}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 whitespace-nowrap transition-colors"
                >
                    Order Confirmed ✅
                </button>
            </div>

            {/* Input */}
            <div className="p-4 bg-white shrink-0">
                <div className="flex items-end gap-2 max-w-4xl mx-auto">
                    <button className="p-3 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors mb-1" aria-label="Attach File">
                        <Paperclip className="w-5 h-5" />
                    </button>
                    <div className="flex-1 bg-zinc-50 border border-zinc-200 rounded-2xl p-1 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                        <textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            className="w-full bg-transparent border-none focus:ring-0 text-zinc-900 placeholder:text-zinc-400 resize-none max-h-32 min-h-[44px] py-2.5 px-3 custom-scrollbar h-auto"
                            rows={1}
                        />
                    </div>
                    <button
                        onClick={handleSend}
                        disabled={!inputValue.trim() || isSending}
                        className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg hover:shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-1"
                        aria-label="Send Message"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
                <div className="text-center mt-2 text-[10px] text-zinc-400">
                    Press Enter to send, Shift + Enter for new line
                </div>
            </div>
        </div>
    );
}
