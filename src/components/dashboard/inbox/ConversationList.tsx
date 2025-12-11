
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface Conversation {
    id: number;
    name: string;
    phone: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    // ... other fields from customers table
}

interface ConversationListProps {
    onSelect: (customer: Conversation) => void;
    selectedId?: number;
}

export default function ConversationList({ onSelect, selectedId }: ConversationListProps) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchConversations = async () => {
            // In a real app we'd debounce search here
            try {
                const res = await fetch(`/api/inbox/conversations?search=${search}`);
                if (res.ok) {
                    const data = await res.json();
                    // Data structure from API: { conversations: [], total: ... } based on previous check
                    // OR just [] based on my *first* implementation intent. 
                    // Let's check the API again...
                    // The API returns { conversations, total, page... }
                    setConversations(data.conversations || []);
                }
            } catch (error) {
                console.error("Failed to load conversations", error);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();

        // Optional: Poll for updates every 30s
        const interval = setInterval(fetchConversations, 30000);
        return () => clearInterval(interval);

    }, [search]); // Re-fetch on search change

    return (
        <div className="flex flex-col h-full bg-white border-r border-gray-200 w-80 lg:w-96 flex-shrink-0">
            {/* Header / Search */}
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-bold mb-4">Inbox</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search messages..."
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="p-4 text-center text-gray-500 text-sm">Loading chats...</div>
                ) : conversations.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <p className="text-sm">No conversations found.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {conversations.map((conv) => (
                            <div
                                key={conv.id}
                                onClick={() => onSelect(conv)}
                                className={cn(
                                    "p-4 hover:bg-gray-50 cursor-pointer transition-colors relative",
                                    selectedId === conv.id ? "bg-indigo-50 hover:bg-indigo-50" : ""
                                )}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className={cn("font-medium text-sm truncate pr-2", selectedId === conv.id ? "text-indigo-900" : "text-gray-900")}>
                                        {conv.name || conv.phone}
                                    </h3>
                                    {conv.lastMessageTime && (
                                        <span className="text-[10px] text-gray-400 flex-shrink-0 whitespace-nowrap">
                                            {formatDistanceToNow(new Date(conv.lastMessageTime), { addSuffix: false })}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 truncate max-w-[90%]">
                                    {conv.lastMessage || "No messages yet"}
                                </p>
                                {/* Unread Badge if needed */}
                                {conv.unreadCount > 0 && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                        {conv.unreadCount}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
