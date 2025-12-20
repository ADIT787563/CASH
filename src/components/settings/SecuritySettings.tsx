"use client";

import { useState } from "react";
import { SettingsSection } from "./SettingsSection";
import { InputGroup } from "./InputGroup";
import { ActionButton } from "@/components/ui/ActionButton";
import { toast } from "sonner";
import { Shield, Smartphone, Key, LogOut } from "lucide-react";

export function SecuritySettings() {
    const [loading, setLoading] = useState(false);

    const handleUpdatePassword = async () => {
        setLoading(true);
        // Mock password update
        await new Promise(r => setTimeout(r, 1500));
        toast.success("Password updated successfully");
        setLoading(false);
    };

    const handleLogoutAll = () => {
        if (confirm("Are you sure? This will log out all other devices.")) {
            toast.success("Logged out from all other devices.");
        }
    }

    return (
        <SettingsSection
            title="Security & Account"
            description="Protect your account with strong authentication."
            onSave={() => { }} // Save handled per section
        >
            {/* Password Change */}
            <div className="space-y-4">
                <h3 className="text-sm font-medium text-slate-900 border-b pb-2 flex items-center gap-2">
                    <Key className="w-4 h-4 text-slate-500" /> Change Password
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputGroup label="Current Password" type="password" />
                    <div />
                    <InputGroup label="New Password" type="password" />
                    <InputGroup label="Confirm New Password" type="password" />
                </div>
                <div className="flex justify-end">
                    <ActionButton onClick={handleUpdatePassword} isLoading={loading}>
                        Update Password
                    </ActionButton>
                </div>
            </div>

            {/* Active Sessions */}
            <div className="space-y-4 mt-8">
                <h3 className="text-sm font-medium text-slate-900 border-b pb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-slate-500" /> Active Sessions
                </h3>

                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 flex items-center justify-between border border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-slate-700 rounded-full text-indigo-600">
                            <Smartphone className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">Windows PC (Chrome)</p>
                            <p className="text-xs text-slate-500">New Delhi, India • Active Now</p>
                        </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded">THIS DEVICE</span>
                </div>

                <div className="bg-white dark:bg-slate-950 rounded-lg p-4 flex items-center justify-between border border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
                            <Smartphone className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">iPhone 14 Pro</p>
                            <p className="text-xs text-slate-500">Mumbai, India • 2 hours ago</p>
                        </div>
                    </div>
                    <button className="text-xs text-rose-600 hover:underline">Revoke</button>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleLogoutAll}
                        className="flex items-center gap-2 text-sm text-slate-600 hover:text-rose-600 transition-colors border px-4 py-2 rounded-lg hover:border-rose-200 hover:bg-rose-50"
                    >
                        <LogOut className="w-4 h-4" />
                        Log Out All Other Devices
                    </button>
                </div>
            </div>
        </SettingsSection>
    );
}
