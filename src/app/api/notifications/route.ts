import { NextResponse } from "next/server";

// Mock Data (In a real app, this would be in a database)
const notifications = [
    { id: 1, title: "New Order #1042", time: "2 min ago", read: false, description: "A new order has been placed for ₹1,200" },
    { id: 2, title: "Payment Received", time: "1 hour ago", read: false, description: "Payment for order #1039 has been confirmed" },
    { id: 3, title: "Campaign Completed", time: "3 hours ago", read: true, description: "Your 'Winter Sale' campaign has finished sending" },
];

export async function GET() {
    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return NextResponse.json(notifications);
}

export async function PATCH() {
    // In a real app, we would update the database here
    await new Promise((resolve) => setTimeout(resolve, 300));
    return NextResponse.json({ success: true });
}
