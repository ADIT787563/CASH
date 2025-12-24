'use client';

import React, { useState, useEffect } from 'react';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import InboxStats from './InboxStats';
import InboxRightPanel from './InboxRightPanel';
import { getConversations, getMessages, LeadWithLastMessage } from '@/app/actions/inbox';
import { MessageSquare } from 'lucide-react';

interface InboxClientProps {
    inboxStats?: any;
    orders?: any[];
    chartData?: any[];
}

export default function InboxClient({ inboxStats, orders, chartData }: InboxClientProps) {
    const [conversations, setConversations] = useState<LeadWithLastMessage[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch conversations on mount
    useEffect(() => {
        loadConversations();
    }, []);

    const loadConversations = async () => {
        try {
            const data = await getConversations();
            setConversations(data);
            if (data.length > 0 && !selectedId) {
                // Auto-select first if none selected
                // setSelectedId(data[0].id); // Optional: don't auto-select on mobile
            }
        } catch (err) {
            console.error("Failed to load conversations", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch messages when selectedId changes
    useEffect(() => {
        if (selectedId) {
            loadMessages(selectedId);
        }
    }, [selectedId]);

    // Verify Rich Messages by forcing them into the first loaded conversation (Temporary for Demo)
    useEffect(() => {
        if (messages.length > 0 && messages[messages.length - 1].content !== "Order Confirmed!" && selectedId) {
            // Only add if not present to avoid dupes on re-render
            // pseudo-logic to inject rich messages for visual verification
            const hasRich = messages.some(m => m.content.includes("Payment Received"));
            if (!hasRich) {
                // Keep this for demo or remove if real messages are flowing
            }
        }
    }, [selectedId, messages.length]);


    const loadMessages = async (id: number) => {
        try {
            const msgs = await getMessages(id);
            setMessages(msgs);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSendMessage = () => {
        // Refresh conversation list to show latest message snippet
        loadConversations();
        // Refresh messages
        if (selectedId) loadMessages(selectedId);
    };

    const selectedLead = conversations.find(c => c.id === selectedId);

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Top Stats Bar */}
            <InboxStats stats={inboxStats} />

            <div className="flex flex-1 gap-4 min-h-0 overflow-hidden">
                {/* 1. Conversations Sidebar */}
                <div className={`w-full md:w-[320px] lg:w-[340px] shrink-0 flex flex-col bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm transition-all duration-300 ${selectedId ? 'hidden md:flex' : 'flex'}`}>
                    <ConversationList
                        conversations={conversations}
                        selectedId={selectedId}
                        onSelect={setSelectedId}
                        isLoading={isLoading}
                    />
                </div>

                {/* 2. Main Chat Area */}
                <div className={`flex-1 bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm relative flex flex-col ${!selectedId ? 'hidden md:flex' : 'flex'}`}>
                    {selectedId && selectedLead ? (
                        <div className="flex-1 flex flex-col relative min-h-0">
                            {/* Back Button for Mobile */}
                            <div className="md:hidden absolute top-4 left-2 z-50">
                                <button
                                    onClick={() => setSelectedId(null)}
                                    className="p-2 bg-white/50 text-zinc-900 border border-zinc-200 rounded-full backdrop-blur-md shadow-sm"
                                >
                                    ← Back
                                </button>
                            </div>

                            <ChatWindow
                                leadId={selectedId}
                                leadName={selectedLead.name}
                                initialMessages={messages}
                                onSendMessage={handleSendMessage}
                            />
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
                            <div className="w-16 h-16 rounded-2xl bg-zinc-50 flex items-center justify-center mb-4 rotate-12 border border-zinc-100">
                                <MessageSquare className="w-8 h-8 text-zinc-300" />
                            </div>
                            <p>Select a conversation to start chatting</p>
                        </div>
                    )}
                </div>

                {/* 3. Right Panel (Orders & Analytics) */}
                <div className="hidden xl:block w-[320px] shrink-0">
                    <InboxRightPanel orders={orders} analyticsData={chartData} />
                </div>
            </div>
        </div>
    );
}
