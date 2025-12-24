import { NextResponse } from "next/server";

export async function GET() {
  // Simulate DB fetch
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Mock Leads Data
  const leads = [
    {
      id: 1,
      name: "Vikram Singh",
      phone: "+91 98765 43210",
      status: "INTERESTED",
      source: "Whatsapp",
      lastMessage: "Price kya hai?",
      lastInteraction: new Date().toISOString(),
      orders: 0,
      spent: 0,
      avatarColor: "bg-green-500",
      email: "vikram@example.com",
      totalOrders: 0,
      totalSpend: 0,
      tags: ["NEW"]
    },
    {
      id: 2,
      name: "Priya Sharma",
      phone: "+91 87654 32109",
      status: "INTERESTED",
      source: "Catalog",
      lastMessage: "Can you give me size chart?",
      lastInteraction: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      orders: 2,
      spent: 4500,
      avatarColor: "bg-indigo-500",
      email: "priya@example.com",
      totalOrders: 2,
      totalSpend: 4500,
      tags: ["REPEAT"]
    },
    {
      id: 3,
      name: "Amit Kumar",
      phone: "+91 76543 21098",
      status: "CONVERTED",
      source: "Campaign",
      lastMessage: "Order confirmed!",
      lastInteraction: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      orders: 5,
      spent: 12500,
      avatarColor: "bg-cyan-500",
      email: "amit@example.com",
      totalOrders: 5,
      totalSpend: 12500,
      tags: ["VIP"]
    },
    {
      id: 4,
      name: "Neha Gupta",
      phone: "+91 65432 10987",
      status: "NEW",
      source: "Whatsapp",
      lastMessage: "Hello, I want to buy...",
      lastInteraction: new Date().toISOString(),
      orders: 0,
      spent: 0,
      avatarColor: "bg-rose-500",
      email: "neha@example.com",
      totalOrders: 0,
      totalSpend: 0,
      tags: ["NEW"]
    }
  ];

  return NextResponse.json(leads);
}