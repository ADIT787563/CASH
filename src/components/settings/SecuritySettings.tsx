"use client";

import { useState, useEffect } from "react";
import { SettingsSection } from "./SettingsSection";
import { InputGroup } from "./InputGroup";
import { ActionButton } from "@/components/ui/ActionButton";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Smartphone, Monitor } from "lucide-react";

export function SecuritySettings() {
    const [loading, setLoading] = useState(true);
    const [securityData, setSecurityData] = useState<any>(null);
    const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
    const [passLoading, setPassLoading] = useState(false);

    useEffect(() => {
        async function fetchSecurity() {
            try {
                const res = await fetch("/api/user/security");
                if (res.ok) {
                    const data = await res.json();
                    setSecurityData(data);
                }
            } catch (error) {
                console.error("Failed to fetch security settings:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchSecurity();
    }, []);

    const handleChangePassword = async () => {
        if (passwords.new !== passwords.confirm) {
            toast.error("New passwords do not match.");
            return;
        }

        setPassLoading(true);
        try {
            const { error } = await authClient.changePassword({
                currentPassword: passwords.current,
                newPassword: passwords.new,
                revokeOtherSessions: true
            });

            if (error) {
                toast.error(error.message || "Failed to update password");
            } else {
                toast.success("Password updated successfully!");
                setPasswords({ current: "", new: "", confirm: "" });
            }
        } catch (err: any) {
            toast.error(err.message || "An error occurred");
        } finally {
            setPassLoading(false);
        }
    };

    if (loading) {
        return (
            <SettingsSection
                title="Security & Account"
                description="Manage your account security and sessions."
            >
                <div className="p-8 text-center text-slate-500">Loading security settings...</div>
            </SettingsSection>
        );
    }

    const { provider, email, sessions } = securityData || {};

    return (
        <SettingsSection
            title="Security & Account"
            description="Manage your account security and sessions."
        >
            <div className="space-y-8">
                {/* Password Change - Only for Email Providers */}
                {provider === 'email' ? (
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">Change Password</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputGroup
                                label="Current Password"
                                type="password"
                                placeholder="Enter current password"
                                value={passwords.current}
                                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                            />
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputGroup
                                    label="New Password"
                                    type="password"
                                    placeholder="Enter new password"
                                    value={passwords.new}
                                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                />
                                <InputGroup
                                    label="Confirm New Password"
                                    type="password"
                                    placeholder="Confirm new password"
                                    value={passwords.confirm}
                                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <button
                                onClick={handleChangePassword}
                                disabled={passLoading || !passwords.current || !passwords.new}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {passLoading ? "Updating..." : "Update Password"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                        <p>You are logged in via <strong>{provider}</strong> ({email}). Password management is handled by your provider.</p>
                    </div>
                )}

                {/* Active Sessions */}
                <div className="border-t border-slate-200 dark:border-slate-800 pt-8">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Active Sessions</h3>
                    <div className="space-y-3">
                        {sessions?.map((session: any) => (
                            <div key={session.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-500">
                                        {session.device.toLowerCase().includes('mobile') ? <Smartphone className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                                            {session.device}
                                            {session.isCurrent && (
                                                <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase">Current</span>
                                            )}
                                        </p>
                                        <div className="flex gap-3 text-xs text-slate-500 mt-1">
                                            <span>{session.location}</span>
                                            <span>•</span>
                                            <span>Last active: {new Date(session.lastActive).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                {!session.isCurrent && (
                                    <button
                                        onClick={async () => {
                                            try {
                                                await fetch('/api/user/security', {
                                                    method: 'DELETE',
                                                    body: JSON.stringify({ sessionId: session.id })
                                                });
                                                setSecurityData((prev: any) => ({
                                                    ...prev,
                                                    sessions: prev.sessions.filter((s: any) => s.id !== session.id)
                                                }));
                                                toast.success("Session revoked");
                                            } catch {
                                                toast.error("Failed to revoke session");
                                            }
                                        }}
                                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                                    >
                                        Revoke
                                    </button>
                                )}
                            </div>
                        ))}
                        {(!sessions || sessions.length === 0) && (
                            <p className="text-sm text-slate-500 italic">No active sessions found.</p>
                        )}
                    </div>
                </div>
            </div>
        </SettingsSection>
    );
}
