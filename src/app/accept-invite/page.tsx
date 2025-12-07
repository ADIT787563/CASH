"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Shield, Mail, Building2, Clock } from 'lucide-react';
import { ROLE_INFO } from '@/lib/permissions';

function AcceptInviteContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [loading, setLoading] = useState(true);
    const [inviteData, setInviteData] = useState<any>(null);
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!token) {
            toast.error('Invalid invite link');
            router.push('/login');
            return;
        }

        loadInviteData();
    }, [token]);

    const loadInviteData = async () => {
        try {
            const response = await fetch(`/api/team/accept?token=${token}`);
            const data = await response.json();

            if (response.ok) {
                setInviteData(data.invite);
            } else {
                toast.error(data.error || 'Invalid or expired invite');
                setTimeout(() => router.push('/login'), 2000);
            }
        } catch (error) {
            console.error('Failed to load invite:', error);
            toast.error('Failed to load invite details');
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        setSubmitting(true);

        try {
            // First, accept the invite
            const acceptResponse = await fetch('/api/team/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, name, password }),
            });

            const acceptData = await acceptResponse.json();

            if (acceptResponse.ok) {
                toast.success('Account created successfully! Please sign in.');
                setTimeout(() => router.push('/login'), 2000);
            } else {
                toast.error(acceptData.error || 'Failed to accept invite');
            }
        } catch (error) {
            console.error('Accept invite error:', error);
            toast.error('Failed to accept invite');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!inviteData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Invalid Invite
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        This invite link is invalid or has expired.
                    </p>
                </div>
            </div>
        );
    }

    const roleInfo = ROLE_INFO[inviteData.role as keyof typeof ROLE_INFO];

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
            <div className="max-w-md w-full">
                {/* Invite Details Card */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                            <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            You've Been Invited!
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {inviteData.businessOwner} has invited you to join their team
                        </p>
                    </div>

                    <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4">
                        <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-gray-400" />
                            <div>
                                <div className="text-sm text-gray-500">Email</div>
                                <div className="font-medium">{inviteData.email}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-gray-400" />
                            <div>
                                <div className="text-sm text-gray-500">Role</div>
                                <div className="font-medium">{roleInfo?.label}</div>
                                <div className="text-sm text-gray-500">{roleInfo?.description}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-gray-400" />
                            <div>
                                <div className="text-sm text-gray-500">Expires</div>
                                <div className="font-medium">
                                    {new Date(inviteData.expiresAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Signup Form */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold mb-4">Complete Your Registration</h2>

                    <form onSubmit={handleAccept} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                                placeholder="John Doe"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                                placeholder="••••••••"
                                minLength={8}
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                                placeholder="••••••••"
                                minLength={8}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            {submitting ? 'Creating Account...' : 'Accept Invite & Create Account'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function AcceptInvitePage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
            <AcceptInviteContent />
        </Suspense>
    );
}
