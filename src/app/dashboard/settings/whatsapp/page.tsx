"use client";

import { useState, useEffect } from 'react';
import { Loader2, Send, CheckCircle, AlertCircle, RefreshCw, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { onboardingService } from '@/services/onboardingService';

export default function WhatsAppSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState<any>(null);
    const [connectData, setConnectData] = useState({
        phoneNumberId: '',
        wabaId: '',
        accessToken: ''
    });
    const [connecting, setConnecting] = useState(false);
    const [testNumber, setTestNumber] = useState('');
    const [sending, setSending] = useState(false);
    const [tokenStatus, setTokenStatus] = useState<any>(null);
    const [newToken, setNewToken] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadSettings();
        checkTokenStatus();
    }, []);

    const loadSettings = async () => {
        try {
            const state = await onboardingService.getState();
            if (state.whatsapp) {
                setSettings(state.whatsapp);
            } else {
                setSettings(null);
            }
        } catch (error) {
            toast.error('Failed to load WhatsApp settings');
        } finally {
            setLoading(false);
        }
    };

    const checkTokenStatus = async () => {
        try {
            const res = await fetch('/api/whatsapp/token');
            if (res.ok) {
                const data = await res.json();
                setTokenStatus(data);
            }
        } catch (error) {
            console.error('Error checking token status:', error);
        }
    };

    const handleConnect = async (e: React.FormEvent) => {
        e.preventDefault();
        setConnecting(true);
        try {
            const res = await fetch('/api/whatsapp/setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(connectData)
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('WhatsApp connected successfully!');
                await loadSettings();
            } else {
                toast.error(data.error || 'Failed to connect WhatsApp');
            }
        } catch (error) {
            toast.error('Error connecting WhatsApp');
        } finally {
            setConnecting(false);
        }
    };

    const handleRefreshToken = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newToken) {
            toast.error('Please enter a new access token');
            return;
        }

        setRefreshing(true);
        try {
            const res = await fetch('/api/whatsapp/token', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accessToken: newToken })
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('Access token updated successfully!');
                setNewToken('');
                await loadSettings();
                await checkTokenStatus();
            } else {
                toast.error(data.error || 'Failed to update token');
            }
        } catch (error) {
            toast.error('Error updating token');
        } finally {
            setRefreshing(false);
        }
    };

    const handleTestSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!testNumber) return;

        setSending(true);
        try {
            const res = await fetch('/api/whatsapp/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to: testNumber })
            });

            const data = await res.json();

            if (res.ok) {
                toast.success('Test message sent successfully!');
            } else {
                toast.error(data.error || 'Failed to send test message');
            }
        } catch (error) {
            toast.error('Error sending test message');
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!settings) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Connect WhatsApp</h1>

                <div className="bg-white p-8 rounded-lg shadow-sm border">
                    <div className="mb-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Send className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-xl font-semibold">Link your WhatsApp Business Account</h2>
                        <p className="text-gray-500 mt-2 max-w-md mx-auto">
                            Enter your Meta Developer credentials to start sending messages and using automations.
                        </p>
                    </div>

                    <form onSubmit={handleConnect} className="space-y-6 max-w-lg mx-auto">
                        <div>
                            <label className="block text-sm font-medium mb-2">Phone Number ID</label>
                            <input
                                type="text"
                                className="w-full p-3 border rounded-lg"
                                placeholder="e.g. 100609346345..."
                                value={connectData.phoneNumberId}
                                onChange={(e) => setConnectData({ ...connectData, phoneNumberId: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">WhatsApp Business Account (WABA) ID</label>
                            <input
                                type="text"
                                className="w-full p-3 border rounded-lg"
                                placeholder="e.g. 100609346345..."
                                value={connectData.wabaId}
                                onChange={(e) => setConnectData({ ...connectData, wabaId: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Permanent Access Token</label>
                            <input
                                type="password"
                                className="w-full p-3 border rounded-lg"
                                placeholder="EAAG..."
                                value={connectData.accessToken}
                                onChange={(e) => setConnectData({ ...connectData, accessToken: e.target.value })}
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Get this from Meta Developer Portal → WhatsApp → API Setup
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={connecting}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                        >
                            {connecting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                            Connect Account
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">WhatsApp Configuration</h1>

            <div className="grid gap-6">
                {/* Status Card */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-lg font-semibold mb-4">Connection Status</h2>
                    <div className="flex items-center text-green-600 bg-green-50 p-4 rounded-md">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        <span className="font-medium">Connected</span>
                    </div>
                </div>

                {/* Token Expiration Warning */}
                {tokenStatus && tokenStatus.needsRefresh && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                        <div className="flex items-start">
                            <AlertTriangle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
                            <div>
                                <h3 className="text-red-800 font-semibold">Access Token Expired or Expiring Soon</h3>
                                <p className="text-red-700 text-sm mt-1">
                                    {tokenStatus.isExpired
                                        ? 'Your access token has expired. Auto-replies will not work until you refresh it.'
                                        : `Your token expires in ${tokenStatus.hoursUntilExpiry} hour(s). Please refresh it soon.`
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Token Status */}
                {tokenStatus && !tokenStatus.needsRefresh && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
                        <div className="flex items-start">
                            <Clock className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                            <div>
                                <h3 className="text-green-800 font-semibold">Token Active</h3>
                                <p className="text-green-700 text-sm mt-1">
                                    Your access token is valid. Expires in {tokenStatus.hoursUntilExpiry} hour(s).
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Token Refresh */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <RefreshCw className="w-5 h-5" />
                        Refresh Access Token
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                        WhatsApp access tokens expire after 24 hours. Get a new token from your Meta App Dashboard → WhatsApp → API Setup.
                    </p>
                    <form onSubmit={handleRefreshToken} className="space-y-4">
                        <div>
                            <label htmlFor="new-token" className="block text-sm font-medium mb-2">New Access Token</label>
                            <input
                                id="new-token"
                                type="text"
                                placeholder="Paste your new access token here"
                                className="w-full p-2 border rounded-md font-mono text-sm"
                                value={newToken}
                                onChange={(e) => setNewToken(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={refreshing}
                            className="bg-primary text-primary-foreground px-4 py-2 rounded-md flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50"
                        >
                            {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                            Update Token
                        </button>
                    </form>
                </div>

                {/* Configuration Details */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-lg font-semibold mb-4">Credentials</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Phone Number ID</label>
                            <div className="mt-1 font-mono bg-gray-50 p-2 rounded border">{settings.phoneNumberId}</div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">WABA ID</label>
                            <div className="mt-1 font-mono bg-gray-50 p-2 rounded border">{settings.wabaId}</div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Access Token</label>
                            <div className="mt-1 font-mono bg-gray-50 p-2 rounded border truncate">
                                {settings.accessToken.substring(0, 10)}...{settings.accessToken.substring(settings.accessToken.length - 5)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Test Message */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-lg font-semibold mb-4">Send Test Message</h2>
                    <form onSubmit={handleTestSend} className="flex gap-4">
                        <input
                            type="tel"
                            placeholder="Recipient Phone Number (e.g. 919876543210)"
                            className="flex-1 p-2 border rounded-md"
                            value={testNumber}
                            onChange={(e) => setTestNumber(e.target.value)}
                            required
                        />
                        <button
                            type="submit"
                            disabled={sending}
                            className="bg-primary text-primary-foreground px-4 py-2 rounded-md flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50"
                        >
                            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            Send Test
                        </button>
                    </form>
                    <p className="text-sm text-gray-500 mt-2">
                        Note: Since your app is in development mode, you can only send messages to numbers verified in your Meta App Dashboard.
                    </p>
                </div>
            </div>
        </div>
    );
}
