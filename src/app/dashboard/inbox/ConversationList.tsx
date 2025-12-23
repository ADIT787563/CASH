'use client';

import React, { useEffect } from 'react';
import { LeadWithLastMessage } from '@/app/actions/inbox';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListProps {
    conversations: LeadWithLastMessage[];
    selectedId: number | null;
    onSelect: (id: number) => void;
    isLoading?: boolean;
}

export default function ConversationList({ conversations, selectedId, onSelect, isLoading }: ConversationListProps) {
    const [searchTerm, setSearchTerm] = React.useState('');

    const filtered = conversations.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );

    return (
        <div className="w-full md:w-[350px] flex flex-col border-r border-white/10 bg-white/5 backdrop-blur-md h-full">
            {/* Header */}
            <div className="p-4 border-b border-white/10 shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-lg text-white">Inbox</h2>
                    <span className="text-xs text-white/50 bg-white/10 px-2 py-1 rounded-full">{conversations.length}</span>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2">
                    {['All', 'Unread', 'Replied'].map((filter) => (
                        <button
                            key={filter}
                            className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors border border-white/5"
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search */}
            <div className="px-4 pb-2 shrink-0">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                        type="text"
                        placeholder="Search name or number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {isLoading ? (
                    <div className="p-4 text-center text-white/40 text-sm">Loading conversations...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-8 text-center text-white/40 text-sm">No conversations found</div>
                ) : (
                    filtered.map((conv) => (
                        <button
                            key={conv.id}
                            onClick={() => onSelect(conv.id)}
                            className={cn(
                                "w-full p-4 flex items-start gap-3 transition-colors text-left hover:bg-white/5 border-b border-white/5",
                                selectedId === conv.id && "bg-primary/10 border-l-4 border-l-primary"
                            )}
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium shrink-0 shadow-lg relative">
                                {conv.name.charAt(0).toUpperCase()}
                                {/* Online Indicator Mock */}
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#1a1a1a] rounded-full"></span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className={cn("font-medium truncate", selectedId === conv.id ? "text-primary-foreground" : "text-white")}>
                                        {conv.name}
                                    </span>
                                    {conv.lastContacted && (
                                        <span className="text-[10px] text-white/40 whitespace-nowrap ml-2">
                                            {formatDistanceToNow(new Date(conv.lastContacted), { addSuffix: true })}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-white/50 truncate mb-1.5">
                                    {conv.lastMessage || <span className="italic">No messages yet</span>}
                                </p>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    {/* Mock Tags for Demo */}
                                    <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                        New Lead
                                    </span>
                                    {conv.id % 2 === 0 && (
                                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                            COD
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}
