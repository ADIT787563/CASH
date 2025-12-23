"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MessageSquare, Clock, CreditCard, ShoppingBag, Zap, AlertTriangle } from "lucide-react";

interface AutoReplyRule {
    id: string;
    name: string;
    description: string;
    icon: any;
    enabled: boolean;
    message: string;
    colorClass: string;
}

export default function AutoRepliesPage() {
    const [rules, setRules] = useState<AutoReplyRule[]>([
        {
            id: "welcome",
            name: "Welcome Message",
            description: "Sent when a new customer messages you for the first time.",
            icon: MessageSquare,
            enabled: true,
            message: "Hi! Welcome to Fashion Store. 🛍️\nCheck out our latest collection here: https://store.link\n\nHow can we help you today?",
            colorClass: "bg-zinc-800 text-zinc-200"
        },
        {
            id: "order_placed",
            name: "Order Confirmation",
            description: "Sent automatically when an order is placed.",
            icon: ShoppingBag,
            enabled: true,
            message: "Thank you for your order! 🎉\nWe have received your order #{order_id}.\nWe will update you once it ships.",
            colorClass: "bg-zinc-800 text-zinc-200"
        },
        {
            id: "payment_received",
            name: "Payment Receipt",
            description: "Sent when payment is successful.",
            icon: CreditCard,
            enabled: true,
            message: "Payment Received! ✅\nAmount: ₹{amount}\nThank you for choosing us!",
            colorClass: "bg-white text-black"
        },
        {
            id: "away",
            name: "Away / Business Hours",
            description: "Reply when you are outside business hours.",
            icon: Clock,
            enabled: false,
            message: "Hi! We are currently closed. 🌙\nOur hours are 9 AM - 9 PM.\nWe will reply as soon as we open!",
            colorClass: "bg-zinc-800 text-zinc-400"
        },
        {
            id: "fallback",
            name: "Fallback Reply",
            description: "Sent when no keywords match (and AI is off).",
            icon: AlertTriangle,
            enabled: false,
            message: "Sorry, I didn't understand that. 😓\nPlease choose an option from the menu below.",
            colorClass: "bg-zinc-900 text-zinc-500"
        }
    ]);

    const toggleRule = (id: string) => {
        setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
    };

    const updateMessage = (id: string, text: string) => {
        setRules(rules.map(r => r.id === id ? { ...r, message: text } : r));
    };

    return (
        <div className="p-6 max-w-5xl mx-auto text-white font-sans">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                    <Zap className="w-8 h-8 text-white" />
                    Auto Replies
                </h1>
                <p className="text-white/60">Manage your automatic responses. Simple, fast, and effective.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {rules.map((rule) => (
                    <Card key={rule.id} className="bg-white/5 border-white/10 backdrop-blur-md">
                        <CardHeader className="pb-3 border-b border-white/5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${rule.colorClass}`}>
                                        <rule.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-semibold text-white">{rule.name}</CardTitle>
                                        <CardDescription className="text-white/40">{rule.description}</CardDescription>
                                    </div>
                                </div>
                                <Switch
                                    checked={rule.enabled}
                                    onCheckedChange={() => toggleRule(rule.id)}
                                    className="data-[state=checked]:bg-green-500"
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {rule.enabled ? (
                                <div className="space-y-2">
                                    <label className="text-xs text-white/50 font-medium uppercase tracking-wider">
                                        Reply Message
                                    </label>
                                    <Textarea
                                        value={rule.message}
                                        onChange={(e) => updateMessage(rule.id, e.target.value)}
                                        rows={3}
                                        className="bg-black/20 border-white/10 text-white placeholder:text-white/20 resize-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                                    />
                                    <div className="flex justify-end">
                                        <Button size="sm" variant="ghost" className="text-xs text-white/40 hover:text-white hover:bg-white/5">
                                            Reset to Default
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-2 text-white/20 text-sm italic">
                                    This rule is currently disabled. Turn it ON to edit.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
