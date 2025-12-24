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
        <div className="w-full md:w-[350px] flex flex-col border-r border-zinc-200 bg-white h-full">
            {/* Header */}
            <div className="p-4 border-b border-zinc-200 shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-lg text-zinc-900">Inbox</h2>
                    <span className="text-xs text-zinc-500 bg-zinc-100 px-2 py-1 rounded-full">{conversations.length}</span>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2">
                    {['All', 'Unread', 'Replied'].map((filter) => (
                        <button
                            key={filter}
                            className="text-xs px-3 py-1.5 rounded-full bg-zinc-50 hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 transition-colors border border-zinc-200"
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search */}
            <div className="px-4 pb-2 shrink-0 pt-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search name or number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {isLoading ? (
                    <div className="p-4 text-center text-zinc-400 text-sm">Loading conversations...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-8 text-center text-zinc-400 text-sm">No conversations found</div>
                ) : (
                    filtered.map((conv) => (
                        <button
                            key={conv.id}
                            onClick={() => onSelect(conv.id)}
                            className={cn(
                                "w-full p-4 flex items-start gap-3 transition-colors text-left hover:bg-zinc-50 border-b border-zinc-100 last:border-0",
                                selectedId === conv.id && "bg-indigo-50 border-l-4 border-l-indigo-600 border-zinc-100"
                            )}
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-medium shrink-0 shadow-sm relative">
                                {conv.name.charAt(0).toUpperCase()}
                                {/* Online Indicator Mock */}
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className={cn("font-semibold truncate", selectedId === conv.id ? "text-indigo-900" : "text-zinc-900")}>
                                        {conv.name}
                                    </span>
                                    {conv.lastContacted && (
                                        <span className="text-[10px] text-zinc-400 whitespace-nowrap ml-2">
                                            {formatDistanceToNow(new Date(conv.lastContacted), { addSuffix: true })}
                                        </span>
                                    )}
                                </div>
                                <p className={cn("text-sm truncate mb-1.5", selectedId === conv.id ? "text-indigo-700/80" : "text-zinc-500")}>
                                    {conv.lastMessage || <span className="italic">No messages yet</span>}
                                </p>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    {/* Mock Tags for Demo */}
                                    <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100">
                                        New Lead
                                    </span>
                                    {conv.id % 2 === 0 && (
                                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100">
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
