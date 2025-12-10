"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProtectedPage from "@/components/ProtectedPage";
import {
    ArrowLeft,
    Save,
    Calendar,
    Users,
    MessageSquare,
    Loader2
} from "lucide-react";

interface Template {
    id: number;
    name: string;
    content: string;
    status: string;
}

export default function NewCampaignPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [templates, setTemplates] = useState<Template[]>([]);

    // Form State
    const [name, setName] = useState("");
    const [templateId, setTemplateId] = useState<number | "">("");
    const [audienceType, setAudienceType] = useState("all");
    const [scheduleType, setScheduleType] = useState("now");
    const [scheduledAt, setScheduledAt] = useState("");

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const res = await fetch('/api/templates');
            if (res.ok) {
                const data = await res.json();
                // Filter only approved templates ideally, but for now show all
                setTemplates(data.filter((t: Template) => t.status === 'approved' || t.status === 'success'));
            }
        } catch (error) {
            console.error("Failed to fetch templates");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                name,
                templateId: Number(templateId),
                audienceConfig: {
                    type: audienceType
                },
                scheduledAt: scheduleType === 'later' ? new Date(scheduledAt).toISOString() : null
            };

            const res = await fetch('/api/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                router.push('/campaigns');
            } else {
                alert("Failed to create campaign");
            }
        } catch (error) {
            console.error(error);
            alert("Error creating campaign");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ProtectedPage>
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <Link href="/campaigns" className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-2">
                            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Campaigns
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Create New Campaign</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* 1. Campaign Details */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-gray-400" />
                                Campaign Details
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Diwali Sale Announcement"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Template</label>
                                    <select
                                        required
                                        value={templateId}
                                        onChange={(e) => setTemplateId(Number(e.target.value))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
                                    >
                                        <option value="">-- Choose a WhatsApp Template --</option>
                                        {templates.map(t => (
                                            <option key={t.id} value={t.id}>
                                                {t.name}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">Only approved templates can be used.</p>
                                </div>
                            </div>
                        </div>

                        {/* 2. Audience */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5 text-gray-400" />
                                Target Audience
                            </h3>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-indigo-500 transition-colors">
                                    <input
                                        type="radio"
                                        name="audience"
                                        id="aud_all"
                                        value="all"
                                        checked={audienceType === 'all'}
                                        onChange={(e) => setAudienceType(e.target.value)}
                                        className="text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="aud_all" className="flex-1 cursor-pointer">
                                        <span className="block text-sm font-medium text-gray-900">All Contacts</span>
                                        <span className="block text-xs text-gray-500">Send to all saved leads and customers</span>
                                    </label>
                                </div>
                                <div className="opacity-50 pointer-events-none flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                                    <input type="radio" name="audience" disabled />
                                    <label className="flex-1">
                                        <span className="block text-sm font-medium text-gray-900">Filter by Tag (Pro)</span>
                                        <span className="block text-xs text-gray-500">Available in Pro plan</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* 3. Schedule */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-gray-400" />
                                Schedule
                            </h3>

                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setScheduleType('now')}
                                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium border ${scheduleType === 'now'
                                                ? 'bg-indigo-50 border-indigo-600 text-indigo-700'
                                                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        Send Now
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setScheduleType('later')}
                                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium border ${scheduleType === 'later'
                                                ? 'bg-indigo-50 border-indigo-600 text-indigo-700'
                                                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        Schedule for Later
                                    </button>
                                </div>

                                {scheduleType === 'later' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                                        <input
                                            type="datetime-local"
                                            required={scheduleType === 'later'}
                                            value={scheduledAt}
                                            onChange={(e) => setScheduledAt(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {scheduleType === 'now' ? 'Launch Campaign' : 'Schedule Campaign'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </ProtectedPage>
    );
}
