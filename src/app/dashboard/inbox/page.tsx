
"use client";

import { useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import ConversationList from "@/components/dashboard/inbox/ConversationList";
import ChatWindow from "@/components/dashboard/inbox/ChatWindow";

export default function InboxPage() {
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

    return (
        <ProtectedPage>
            <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white">
                {/* 64px is approx header height, adjust based on your layout */}
                <ConversationList
                    onSelect={setSelectedCustomer}
                    selectedId={selectedCustomer?.id}
                />
                <ChatWindow customer={selectedCustomer} />
            </div>
        </ProtectedPage>
    );
}
