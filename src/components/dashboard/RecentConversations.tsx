
"use client";

import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { format, isValid, parseISO } from "date-fns";

interface Conversation {
    id: number | string;
    name: string;
    message: string;
    time: string;
    unreadCount?: number;
    initials?: string;
}

interface RecentConversationsProps {
    conversations: Conversation[];
}

export function RecentConversations({ conversations }: RecentConversationsProps) {

    const formatDate = (dateString: string) => {
        try {
            if (!dateString) return "";
            const date = new Date(dateString);
            if (!isValid(date)) return "";
            return format(date, "h:mm a"); // e.g. "2:30 PM"
        } catch {
            return "";
        }
    };

    return (
        <div className="bg-[#0F1115] border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-bold text-lg">Inbox</h3>
                <Link href="/inbox" className="text-emerald-500 text-sm font-medium hover:text-emerald-400 flex items-center gap-1">
                    View All <span className="text-lg">›</span>
                </Link>
            </div>

            <div className="space-y-4">
                {conversations.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No conversations yet</p>
                    </div>
                ) : (
                    conversations.map((conv, i) => (
                        <div key={i} className="flex items-start gap-4 p-3 hover:bg-slate-800/30 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-800">
                            {/* Avatar */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${i % 3 === 0 ? "bg-zinc-800/50 text-zinc-300 border border-zinc-700" :
                                i % 3 === 1 ? "bg-zinc-900/50 text-zinc-400 border border-zinc-800" :
                                    "bg-white/10 text-white border border-white/20"
                                }`}>
                                {conv.initials || conv.name.substring(0, 2).toUpperCase()}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-white font-medium truncate">{conv.name}</h4>
                                        <MessageSquare className="w-3 h-3 text-emerald-500/50" />
                                    </div>
                                    {conv.unreadCount ? (
                                        <div className="bg-emerald-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                            {conv.unreadCount}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-slate-500">{formatDate(conv.time)}</span>
                                    )}
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-slate-400 text-sm truncate pr-4">{conv.message}</p>
                                    {conv.unreadCount ? (
                                        <span className="text-xs text-slate-500 whitespace-nowrap">{formatDate(conv.time)}</span>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
