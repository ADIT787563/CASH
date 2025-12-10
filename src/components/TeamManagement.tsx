"use client";

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { ROLE_INFO } from '@/lib/permissions';
import { toast } from 'sonner';
import { Users, Mail, Trash2, Shield, Clock, CheckCircle, XCircle } from 'lucide-react';

interface TeamMember {
    id: number;
    email: string;
    name: string;
    role: string;
    status: string;
    invitedAt: string;
    acceptedAt?: string;
    memberUserId?: string;
}

interface TeamInvite {
    id: number;
    email: string;
    role: string;
    status: string;
    expiresAt: string;
    inviteUrl?: string;
}

export function TeamManagement() {
    const { data: session } = useSession();
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [invites, setInvites] = useState<TeamInvite[]>([]);
    const [loading, setLoading] = useState(true);
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('viewer');

    const userRole = (session?.user as any)?.role || 'viewer';

    useEffect(() => {
        loadTeamData();
    }, []);

    const loadTeamData = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/settings/team');
            if (response.ok) {
                const data = await response.json();
                setTeamMembers(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Failed to load team members:', error);
            toast.error('Failed to load team members');
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!inviteEmail || !inviteRole) {
            toast.error('Please fill in all fields');
            return;
        }

        try {
            const response = await fetch('/api/settings/team', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Team member invited successfully!');
                setShowInviteForm(false);
                setInviteEmail('');
                setInviteRole('viewer');
                loadTeamData();

                // Show invite URL (in production, this would be sent via email)
                if (data.invite?.inviteUrl) {
                    navigator.clipboard.writeText(data.invite.inviteUrl);
                    toast.success('Invite link copied to clipboard!');
                }
            } else {
                toast.error(data.error || 'Failed to send invite');
            }
        } catch (error) {
            console.error('Invite error:', error);
            toast.error('Failed to send invite');
        }
    };

    const handleRemoveMember = async (memberUserId: string) => {
        if (!confirm('Are you sure you want to remove this team member?')) {
            return;
        }

        try {
            const response = await fetch(`/api/team/remove?userId=${memberUserId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success('Team member removed successfully');
                loadTeamData();
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to remove team member');
            }
        } catch (error) {
            console.error('Remove error:', error);
            toast.error('Failed to remove team member');
        }
    };

    const getRoleBadgeColor = (role: string) => {
        const colors: Record<string, string> = {
            owner: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            manager: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            agent: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
        };
        return colors[role] || colors.viewer;
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'pending':
                return <Clock className="w-4 h-4 text-yellow-500" />;
            case 'revoked':
                return <XCircle className="w-4 h-4 text-red-500" />;
            default:
                return null;
        }
    };

    const canManage = userRole === 'owner' || userRole === 'admin';

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="w-6 h-6" />
                        Team Members
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Manage your team and their access levels
                    </p>
                </div>

                {canManage && (
                    <button
                        onClick={() => setShowInviteForm(!showInviteForm)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                    >
                        <Mail className="w-4 h-4" />
                        Invite Member
                    </button>
                )}
            </div>

            {/* Invite Form */}
            {showInviteForm && canManage && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold mb-4">Invite Team Member</h3>
                    <form onSubmit={handleInvite} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Email Address</label>
                            <input
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                                placeholder="colleague@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Role</label>
                            <select
                                value={inviteRole}
                                onChange={(e) => setInviteRole(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                            >
                                {Object.entries(ROLE_INFO)
                                    .filter(([role]) => role !== 'owner') // Can't invite as owner
                                    .map(([role, info]) => (
                                        <option key={role} value={role}>
                                            {info.label} - {info.description}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                Send Invite
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowInviteForm(false)}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Team Members List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {teamMembers.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No team members yet. Invite someone to get started!</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Member
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Invited
                                    </th>
                                    {canManage && (
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {teamMembers.map((member) => (
                                    <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium">{member.name}</div>
                                                <div className="text-sm text-gray-500">{member.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                                                <Shield className="w-3 h-3" />
                                                {ROLE_INFO[member.role as keyof typeof ROLE_INFO]?.label || member.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(member.status)}
                                                <span className="text-sm capitalize">{member.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(member.invitedAt).toLocaleDateString()}
                                        </td>
                                        {canManage && (
                                            <td className="px-6 py-4 text-right">
                                                {member.role !== 'owner' && (
                                                    <button
                                                        onClick={() => handleRemoveMember(member.memberUserId || '')}
                                                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                        title="Remove member"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
