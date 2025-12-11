import { useState } from "react";
import { CheckCircle2, Truck, XCircle, Loader2 } from "lucide-react";
import { Order } from "@/types/order";

interface OrderActionsProps {
    orderId: number;
    currentStatus: string;
    onStatusUpdate: () => void;
}

export default function OrderActions({ orderId, currentStatus, onStatusUpdate }: OrderActionsProps) {
    const [loading, setLoading] = useState<string | null>(null);

    const handleAction = async (action: string, status: string) => {
        if (!confirm(`Are you sure you want to mark this order as ${status}?`)) return;

        setLoading(action);
        try {
            const res = await fetch(`/api/orders/${orderId}/actions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: status }),
            });

            if (res.ok) {
                onStatusUpdate();
            } else {
                alert("Failed to update status");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        } finally {
            setLoading(null);
        }
    };

    if (currentStatus === 'cancelled' || currentStatus === 'delivered') {
        return null; // No actions available for final states
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
                {currentStatus === 'pending' && (
                    <button
                        onClick={() => handleAction('confirm', 'confirmed')}
                        disabled={!!loading}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                        {loading === 'confirm' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Confirm Order
                    </button>
                )}

                {(currentStatus === 'confirmed' || currentStatus === 'pending') && (
                    <button
                        onClick={() => handleAction('ship', 'shipped')}
                        disabled={!!loading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {loading === 'ship' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
                        Mark Shipped
                    </button>
                )}

                {(currentStatus === 'shipped') && (
                    <button
                        onClick={() => handleAction('deliver', 'delivered')}
                        disabled={!!loading}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                        {loading === 'deliver' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Mark Delivered
                    </button>
                )}

                <button
                    onClick={() => handleAction('cancel', 'cancelled')}
                    disabled={!!loading}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors ml-auto"
                >
                    {loading === 'cancel' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    Cancel Order
                </button>
            </div>
        </div>
    );
}
