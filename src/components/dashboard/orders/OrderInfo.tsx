import { Calendar, CreditCard, MapPin, Phone, User, Mail, FileText } from "lucide-react";
import { Order } from "@/types/order";

interface OrderInfoProps {
    order: Order;
}

export default function OrderInfo({ order }: OrderInfoProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount / 100);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Details */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-600" />
                    Customer Details
                </h3>
                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <User className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                            <p className="text-xs text-gray-500">Customer</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-gray-900">{order.customerPhone}</p>
                            <p className="text-xs text-gray-500">Phone</p>
                        </div>
                    </div>
                    {order.customerEmail && (
                        <div className="flex items-start gap-3">
                            <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-gray-900">{order.customerEmail}</p>
                                <p className="text-xs text-gray-500">Email</p>
                            </div>
                        </div>
                    )}
                    {order.shippingAddress && (
                        <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-gray-900 whitespace-pre-wrap">{order.shippingAddress}</p>
                                <p className="text-xs text-gray-500">Shipping Address</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    Order Summary
                </h3>
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Order ID</span>
                        <span className="font-medium text-gray-900">#{order.id}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Date</span>
                        <span className="font-medium text-gray-900">{new Date(order.orderDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Payment Method</span>
                        <span className="font-medium text-gray-900 capitalize">{order.paymentMethod || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Payment Status</span>
                        <span className={`font-medium capitalize ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-600'
                            }`}>{order.paymentStatus}</span>
                    </div>

                    <div className="border-t border-gray-100 my-3 pt-3 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Subtotal</span>
                            <span className="text-gray-900">{formatCurrency(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Tax</span>
                            <span className="text-gray-900">{formatCurrency(order.taxAmount)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Shipping</span>
                            <span className="text-gray-900">{formatCurrency(order.shippingAmount)}</span>
                        </div>
                        {order.discountAmount > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                                <span>Discount</span>
                                <span>-{formatCurrency(order.discountAmount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-100">
                            <span className="text-gray-900">Total</span>
                            <span className="text-indigo-600">{formatCurrency(order.totalAmount)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
