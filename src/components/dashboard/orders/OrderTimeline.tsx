import { Clock, CheckCircle2, Truck, XCircle, AlertCircle } from "lucide-react";
import { Order } from "@/types/order";

interface OrderTimelineProps {
    timeline: Order["timeline"];
}

export default function OrderTimeline({ timeline }: OrderTimelineProps) {
    if (!timeline || timeline.length === 0) return null;

    const getIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed': return <CheckCircle2 className="w-5 h-5 text-indigo-600" />;
            case 'shipped': return <Truck className="w-5 h-5 text-blue-600" />;
            case 'delivered': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
            case 'cancelled': return <XCircle className="w-5 h-5 text-red-600" />;
            case 'pending': return <Clock className="w-5 h-5 text-gray-400" />;
            default: return <AlertCircle className="w-5 h-5 text-gray-500" />;
        }
    };

    // Sort timeline by date descending (newest first)
    const sortedTimeline = [...timeline].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mt-6">
            <h3 className="font-semibold text-gray-900 mb-6">Order History</h3>
            <div className="relative border-l-2 border-gray-100 ml-3 space-y-8">
                {sortedTimeline.map((event, index) => (
                    <div key={index} className="relative pl-8">
                        {/* Icon Bubble */}
                        <div className="absolute -left-[11px] top-0 bg-white p-1 rounded-full border border-gray-100 shadow-sm">
                            {getIcon(event.status)}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                            <div>
                                <p className="font-medium text-gray-900 capitalize">
                                    {event.status.replace('_', ' ')}
                                </p>
                                {event.note && (
                                    <p className="text-sm text-gray-500 mt-1">{event.note}</p>
                                )}
                            </div>
                            <span className="text-xs text-gray-400 mt-1 sm:mt-0 whitespace-nowrap">
                                {new Date(event.createdAt).toLocaleString()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
