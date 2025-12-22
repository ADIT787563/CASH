
import { Bot, ChevronRight } from "lucide-react";
import Link from "next/link";

interface AiStatusCardProps {
    active: boolean;
    repliesToday: number;
    avgResponseTime: string; // e.g., "2.3s"
    satisfaction: string; // e.g., "98%"
}

export function AiStatusCard({ active, repliesToday, avgResponseTime, satisfaction }: AiStatusCardProps) {
    return (
        <div className="bg-[#0F1115] border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center text-cyan-500">
                        <Bot className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold">AI Chatbot</h3>
                        <p className="text-slate-500 text-xs">Status</p>
                    </div>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-xs font-medium border ${active
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : "bg-red-500/10 text-red-500 border-red-500/20"
                    }`}>
                    <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-red-500"}`} />
                        {active ? "Active" : "Inactive"}
                    </div>
                </div>
            </div>

            <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Auto-replies today</span>
                    <span className="text-white font-semibold">{repliesToday}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Avg response time</span>
                    <span className="text-white font-semibold">{avgResponseTime}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Satisfaction rate</span>
                    <span className="text-emerald-500 font-semibold">{satisfaction}</span>
                </div>
            </div>

            <Link
                href="/chat-flow"
                className="w-full bg-[#0A0A0A] border border-slate-800 hover:border-slate-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 group"
            >
                Configure AI
            </Link>
        </div>
    );
}
