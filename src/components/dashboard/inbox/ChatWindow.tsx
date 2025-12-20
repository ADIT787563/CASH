
import { useEffect, useState, useRef } from "react";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import { Loader2 } from "lucide-react";

interface Customer {
    id: number;
    name: string;
    phone: string;
}

interface Message {
    id: number;
    content: string;
    direction: string; // 'inbound' | 'outbound'
    timestamp: string;
    status: string;
}

interface ChatWindowProps {
    customer: Customer | null;
}

export default function ChatWindow({ customer }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Fetch Messages when customer changes
    useEffect(() => {
        if (!customer) {
            setMessages([]);
            return;
        }

        const fetchMessages = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/inbox/messages/${customer.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setMessages(data.messages || []);
                }
            } catch (error) {
                console.error("Failed to fetch messages", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();

        // Optional: Poll for new messages
        const interval = setInterval(async () => {
            // Simple polling: refetch all (inefficient but works for V1)
            // Ideally we fetch only "after timestamp"
            try {
                const res = await fetch(`/api/inbox/messages/${customer.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setMessages(data.messages || []);
                }
            } catch (e) { }
        }, 5000); // 5 seconds polling while open

        return () => clearInterval(interval);

    }, [customer?.id]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, customer]); // Trigger on messages change or customer switch

    const handleSendMessage = async (text: string) => {
        if (!customer) return;

        // Optimistic Update
        const tempId = Date.now();
        const tempMsg: Message = {
            id: tempId,
            content: text,
            direction: 'outbound',
            timestamp: new Date().toISOString(),
            status: 'pending'
        };

        setMessages(prev => [...prev, tempMsg]);

        try {
            const res = await fetch('/api/inbox/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId: customer.id,
                    content: text
                })
            });

            if (!res.ok) throw new Error("Failed to send");

            // Server returns the actual message object, let's update it
            const savedMsg = await res.json();

            setMessages(prev => prev.map(m => m.id === tempId ? { ...savedMsg, status: 'sent' } : m));

        } catch (error) {
            console.error("Send failed", error);
            setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'failed' } : m));
        }
    };

    if (!customer) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-400">
                <p>Select a conversation to start chatting</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-[#EFE7DD] relative"> {/* WhatsApp-ish background color */}
            {/* Header */}
            <div className="bg-white p-4 border-b border-gray-200 flex items-center shadow-sm z-10">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold mr-3">
                    {customer.name?.charAt(0) || customer.phone.charAt(0)}
                </div>
                <div>
                    <h2 className="font-bold text-gray-900">{customer.name || customer.phone}</h2>
                    <p className="text-xs text-gray-500">{customer.phone}</p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6" ref={scrollRef}>
                {loading ? (
                    <div className="flex justify-center p-4">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10 text-sm">
                        <p>No messages yet.</p>
                        <p>Send a message to start the conversation.</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <MessageBubble
                            key={msg.id}
                            content={msg.content}
                            isOutbound={msg.direction === 'outbound'}
                            timestamp={msg.timestamp}
                            status={msg.status}
                        />
                    ))
                )}
            </div>

            {/* Input Area */}
            <ChatInput
                onSend={handleSendMessage}
                customerId={customer.id} // Passing ID to allow AI suggestion logic inside input or passed down
            />

        </div>
    );
}
