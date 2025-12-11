import { Package } from "lucide-react";
import { Order } from "@/types/order";

interface OrderItemsProps {
    items: Order["items"];
    currency?: string;
}

export default function OrderItems({ items, currency = 'INR' }: OrderItemsProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
        }).format(amount / 100);
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-6">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-gray-900">Order Items</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3">Product</th>
                            <th className="px-6 py-3 text-right">Price</th>
                            <th className="px-6 py-3 text-center">Quantity</th>
                            <th className="px-6 py-3 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {items.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    {item.productName}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {formatCurrency(item.unitPrice)}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {item.quantity}
                                </td>
                                <td className="px-6 py-4 text-right font-medium text-gray-900">
                                    {formatCurrency(item.totalPrice)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
