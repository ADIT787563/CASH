import { notFound } from "next/navigation";
import { db } from "@/db";
import { orders, orderItems, businessProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Printer } from "lucide-react";

interface InvoicePageProps {
    params: Promise<{
        orderId: string;
    }>;
}

export default async function InvoicePage({ params }: InvoicePageProps) {
    const { orderId } = await params;
    const id = parseInt(orderId);

    if (isNaN(id)) return notFound();

    // 1. Fetch Order
    // Using findFirst with relations would be cleaner but manual queries are safer if relations aren't perfect
    const order = await db.query.orders.findFirst({
        where: eq(orders.id, id),
    });

    if (!order) return notFound();

    // 2. Fetch Line Items
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));

    // 3. Fetch Seller Business Profile
    const sellerProfile = await db.query.businessProfiles.findFirst({
        where: eq(businessProfiles.userId, order.userId),
    });

    // Helper for currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: order.currency || 'INR',
        }).format(amount / 100);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8 print:p-0 print:bg-white">
            <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden print:shadow-none">

                {/* Header / Actions */}
                <div className="bg-gray-50 border-b border-gray-200 p-4 flex justify-between items-center print:hidden">
                    <div className="text-sm text-gray-500">
                        Invoice for Order #{orderId}
                    </div>
                    <button
                        // onClick="window.print()" - Client side only, doing inline via script or simple text
                        // In Next.js server component we can't use onClick directly easily without client component
                        // We'll make a small client wrapper or just a form button that calls print
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                    >
                        <Printer className="w-4 h-4" />
                        <span onClick={() => { }} className="print-btn">Print / Save PDF</span>
                    </button>
                </div>

                {/* Invoice Content */}
                <div className="p-8">
                    {/* Top Bar */}
                    <div className="flex justify-between items-start mb-12">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">INVOICE</h1>
                            <p className="text-gray-500 font-medium">#{order.invoiceNumber || `DRAFT-${order.id}`}</p>
                            {order.paymentStatus === 'paid' ? (
                                <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold uppercase tracking-wider">
                                    PAID
                                </span>
                            ) : (
                                <span className="inline-block mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold uppercase tracking-wider">
                                    {order.paymentStatus}
                                </span>
                            )}
                        </div>
                        <div className="text-right">
                            {/* {sellerProfile?.logoUrl && (
                                <img src={sellerProfile.logoUrl} alt="Logo" className="h-16 w-auto mb-4 ml-auto object-contain" />
                            )} */}
                            <h2 className="text-xl font-bold text-gray-900">{sellerProfile?.businessName || 'Seller'}</h2>
                            <p className="text-gray-600 whitespace-pre-line text-sm mt-1">
                                {sellerProfile?.street}
                                {sellerProfile?.city ? `, ${sellerProfile.city}` : ''}
                                {sellerProfile?.state ? `, ${sellerProfile.state}` : ''}
                                {sellerProfile?.pincode ? ` - ${sellerProfile.pincode}` : ''}
                            </p>
                            {sellerProfile?.gstNumber && (
                                <p className="text-sm text-gray-500 mt-2">GSTIN: {sellerProfile.gstNumber}</p>
                            )}
                        </div>
                    </div>

                    {/* Bill To / Date */}
                    <div className="grid grid-cols-2 gap-12 mb-12">
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Bill To</h3>
                            <p className="text-lg font-bold text-gray-900">{order.customerName}</p>
                            <p className="text-gray-600">{order.customerEmail}</p>
                            <p className="text-gray-600">{order.customerPhone}</p>
                            {order.shippingAddress && (
                                <p className="text-gray-600 mt-2 text-sm whitespace-pre-wrap max-w-xs">{order.shippingAddress.replace(/"/g, '')}</p>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Date</h3>
                                <p className="font-medium text-gray-900">{new Date(order.orderDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Order ID</h3>
                                <p className="font-medium text-gray-900">#{order.id}</p>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <table className="w-full mb-12">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Item</th>
                                <th className="text-right py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Qty</th>
                                <th className="text-right py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Price</th>
                                <th className="text-right py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {items.map((item) => (
                                <tr key={item.id}>
                                    <td className="py-4 text-sm text-gray-900 font-medium">{item.productName}</td>
                                    <td className="py-4 text-sm text-gray-600 text-right">{item.quantity}</td>
                                    <td className="py-4 text-sm text-gray-600 text-right">{formatCurrency(item.unitPrice)}</td>
                                    <td className="py-4 text-sm text-gray-900 font-medium text-right">{formatCurrency(item.totalPrice)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end mb-12">
                        <div className="w-64">
                            <div className="flex justify-between py-2 text-sm text-gray-600">
                                <span>Subtotal</span>
                                <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between py-2 text-sm text-gray-600">
                                <span>Tax</span>
                                <span className="font-medium">{formatCurrency(order.taxAmount || 0)}</span>
                            </div>
                            {(order.discountAmount || 0) > 0 && (
                                <div className="flex justify-between py-2 text-sm text-green-600">
                                    <span>Discount</span>
                                    <span className="font-medium">-{formatCurrency(order.discountAmount || 0)}</span>
                                </div>
                            )}
                            <div className="flex justify-between py-3 border-t border-gray-200 text-base font-bold text-gray-900 mt-2">
                                <span>Total</span>
                                <span>{formatCurrency(order.totalAmount)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-400">
                        <p>Allow 24h for payment to reflect in your account.</p>
                        <p>Generated by Wavegroww Platform</p>
                    </div>
                </div>
            </div>

            {/* Print Script */}
            <script dangerouslySetInnerHTML={{
                __html: `
            document.querySelector('.print-btn').parentElement.addEventListener('click', () => window.print());
          `
            }} />
        </div>
    );
}
