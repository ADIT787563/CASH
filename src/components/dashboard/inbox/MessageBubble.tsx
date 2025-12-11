
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface MessageBubbleProps {
    content: string;
    isOutbound: boolean; // true if sent by business, false if received
    timestamp: string;
    status?: string; // sent, delivered, read, failed
}

export default function MessageBubble({ content, isOutbound, timestamp, status }: MessageBubbleProps) {
    return (
        <div className={cn("flex w-full mt-2 space-x-3 max-w-ws", isOutbound ? "justify-end" : "justify-start")}>
            <div className={cn(
                "relative text-sm py-2 px-4 shadow rounded-xl max-w-[70%]",
                isOutbound
                    ? "bg-indigo-600 text-white rounded-br-none"
                    : "bg-white text-gray-800 rounded-bl-none border border-gray-100"
            )}>
                <div>{content}</div>
                <div className={cn("text-[10px] mt-1 text-right opacity-70", isOutbound ? "text-indigo-100" : "text-gray-400")}>
                    {format(new Date(timestamp), 'h:mm a')}
                    {isOutbound && status && (
                        <span className="ml-1 capitalize">• {status}</span>
                    )}
                </div>
            </div>
        </div>
    );
}
