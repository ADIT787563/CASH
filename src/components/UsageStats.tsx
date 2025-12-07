"use client";

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { TrendingUp, Zap, MessageSquare, Bot, Clock, ArrowUp } from 'lucide-react';

interface UsageData {
    plan: string;
    usage: {
        api: {
            current: number;
            limit: number;
            remaining: number;
            resetAt: string;
            window: string;
        };
        messages: {
            current: number;
            limit: number;
            remaining: number;
            resetAt: string;
            window: string;
        };
        chatbot: {
            current: number;
            limit: number;
            remaining: number;
            resetAt: string;
            window: string;
        };
    };
}

export function UsageStats() {
    const [usageData, setUsageData] = useState<UsageData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUsageData();
        // Refresh every 30 seconds
        const interval = setInterval(loadUsageData, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadUsageData = async () => {
        try {
            const response = await fetch('/api/usage/stats');
            if (response.ok) {
                const data = await response.json();
                setUsageData(data);
            } else {
                toast.error('Failed to load usage statistics');
            }
        } catch (error) {
            console.error('Failed to load usage:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPercentage = (current: number, limit: number) => {
        return Math.min(100, (current / limit) * 100);
    };

    const getProgressColor = (percentage: number) => {
        if (percentage >= 90) return 'bg-red-500';
        if (percentage >= 75) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const formatTimeUntilReset = (resetAt: string) => {
        const now = new Date();
        const reset = new Date(resetAt);
        const diff = reset.getTime() - now.getTime();

        if (diff <= 0) return 'Resetting...';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (hours > 0) return `${hours}h ${minutes}m`;
        if (minutes > 0) return `${minutes}m ${seconds}s`;
        return `${seconds}s`;
    };

    const getPlanBadgeColor = (plan: string) => {
        const colors: Record<string, string> = {
            starter: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
            growth: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
            pro: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            enterprise: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        };
        return colors[plan] || colors.starter;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!usageData) {
        return null;
    }

    const { plan, usage } = usageData;
    const normalizedPlan = (plan || 'starter').toLowerCase();
    const planLabel = normalizedPlan.charAt(0).toUpperCase() + normalizedPlan.slice(1);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <TrendingUp className="w-6 h-6" />
                        Usage Statistics
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Monitor your current usage and limits
                    </p>
                </div>

                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getPlanBadgeColor(normalizedPlan)}`}>
                    {planLabel} Plan
                </span>
            </div>

            {/* Usage Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* API Usage */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-blue-500" />
                            <h3 className="font-semibold">API Requests</h3>
                        </div>
                        <span className="text-sm text-gray-500">{usage.api.window}</span>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-gray-600 dark:text-gray-400">
                                    {usage.api.current} / {usage.api.limit}
                                </span>
                                <span className="font-medium">{usage.api.remaining} remaining</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all ${getProgressColor(getPercentage(usage.api.current, usage.api.limit))}`}
                                    style={{ width: `${getPercentage(usage.api.current, usage.api.limit)}%` }}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>Resets in {formatTimeUntilReset(usage.api.resetAt)}</span>
                        </div>
                    </div>
                </div>

                {/* Message Usage */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-green-500" />
                            <h3 className="font-semibold">Messages</h3>
                        </div>
                        <span className="text-sm text-gray-500">{usage.messages.window}</span>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-gray-600 dark:text-gray-400">
                                    {usage.messages.current} / {usage.messages.limit}
                                </span>
                                <span className="font-medium">{usage.messages.remaining} remaining</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all ${getProgressColor(getPercentage(usage.messages.current, usage.messages.limit))}`}
                                    style={{ width: `${getPercentage(usage.messages.current, usage.messages.limit)}%` }}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>Resets in {formatTimeUntilReset(usage.messages.resetAt)}</span>
                        </div>
                    </div>
                </div>

                {/* Chatbot Usage */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Bot className="w-5 h-5 text-purple-500" />
                            <h3 className="font-semibold">Chatbot Replies</h3>
                        </div>
                        <span className="text-sm text-gray-500">{usage.chatbot.window}</span>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-gray-600 dark:text-gray-400">
                                    {usage.chatbot.current} / {usage.chatbot.limit}
                                </span>
                                <span className="font-medium">{usage.chatbot.remaining} remaining</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all ${getProgressColor(getPercentage(usage.chatbot.current, usage.chatbot.limit))}`}
                                    style={{ width: `${getPercentage(usage.chatbot.current, usage.chatbot.limit)}%` }}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>Resets in {formatTimeUntilReset(usage.chatbot.resetAt)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upgrade Prompt */}
            {normalizedPlan === 'starter' && (usage.api.current / usage.api.limit > 0.7 || usage.messages.current / usage.messages.limit > 0.7) && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
                    <div className="flex items-start gap-4">
                        <ArrowUp className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">Approaching Your Limits</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                You're using a significant portion of your {planLabel} plan limits. Upgrade to Growth, Pro, or Enterprise for higher limits and more features.
                            </p>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                                Upgrade Plan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
