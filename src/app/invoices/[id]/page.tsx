import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { invoices, user, subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

import { Printer } from "lucide-react";
import InvoiceClientButtons from "./InvoiceClientButtons"; // We'll create this small client component for the print button

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        redirect("/login");
    }

    // Fetch Invoice
    const invoice = await db.query.invoices.findFirst({
        where: eq(invoices.id, id),
    });

    if (!invoice || invoice.userId !== session.user.id) {
        notFound();
    }

    // Since we don't have explicit plan relations in invoice usually, we might need to fetch subscription
    let planName = "Subscription";
    if (invoice.subscriptionId) {
        const sub = await db.query.subscriptions.findFirst({
            where: eq(subscriptions.id, invoice.subscriptionId)
        });
        if (sub) {
            // Map planId to Name
            const plans: Record<string, string> = {
                'starter': 'Basic Plan',
                'growth': 'Growth Plan',
                'pro': 'Pro / Agency Plan',
                'enterprise': 'Enterprise Plan'
            };
            planName = plans[sub.planId] || sub.planId;
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8 md:p-12 print:p-0 print:bg-white">
            <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden print:shadow-none print:rounded-none">

                {/* Header / Actions */}
                <div className="bg-gray-900 text-white p-6 flex justify-between items-center print:hidden">
                    <div className="text-sm opacity-80">Invoice #{invoice.invoiceNo || invoice.id.substring(0, 8).toUpperCase()}</div>
                    <InvoiceClientButtons />
                </div>

                {/* Invoice Content */}
                <div className="p-8 md:p-12">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-12">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">INVOICE</h1>
                            <p className="text-gray-500 mt-1">Receipt #{invoice.invoiceNo || invoice.id.substring(0, 8).toUpperCase()}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-xl font-bold text-primary">WaveGroww</div>
                            <div className="text-sm text-gray-500 mt-1">
                                WhatsApp Automation<br />
                                India
                            </div>
                        </div>
                    </div>

                    {/* Bill To / From */}
                    <div className="grid grid-cols-2 gap-12 mb-12">
                        <div>
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Billed To</h3>
                            <div className="text-gray-900 font-medium">{session.user.name}</div>
                            <div className="text-gray-600 text-sm mt-1">{session.user.email}</div>
                        </div>
                        <div className="text-right">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Date</h3>
                            <div className="text-gray-900 font-medium">
                                {new Date(invoice.createdAt).toLocaleDateString("en-IN", {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Line Items */}
                    <table className="w-full mb-12">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 text-sm font-semibold text-gray-600">Description</th>
                                <th className="text-right py-3 text-sm font-semibold text-gray-600">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-100">
                                <td className="py-4 text-gray-900">
                                    {planName}
                                    <span className="block text-xs text-gray-500 mt-0.5">Monthly Subscription</span>
                                </td>
                                <td className="py-4 text-right text-gray-900 font-medium">
                                    ₹{(invoice.amount / 100).toFixed(2)}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Total */}
                    <div className="flex justify-end mb-12">
                        <div className="w-1/2">
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">₹{(invoice.amount / 100).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-600">Tax (0%)</span>
                                <span className="font-medium">₹0.00</span>
                            </div>
                            <div className="flex justify-between py-4">
                                <span className="text-lg font-bold text-gray-900">Total</span>
                                <span className="text-lg font-bold text-primary">₹{(invoice.amount / 100).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 pt-8 text-center text-xs text-gray-500">
                        <p className="mb-2">Thank you for your business!</p>
                        <p>Questions? Contact support@wavegroww.com</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
