
import { Zap } from "lucide-react";

interface UsageCardProps {
    used: number;
    limit: number;
}

export function UsageCard({ used, limit }: UsageCardProps) {
    const percentage = Math.min(Math.round((used / limit) * 100), 100);

    return (
        <div className="bg-[#0D1514] border border-[#1A2E29] rounded-xl p-5 relative overflow-hidden group">
            {/* Background Gradient Effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full -mr-10 -mt-10" />

            <div className="relative z-10">
                <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-500">
                        <Zap className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-slate-400 text-sm font-medium">Monthly Usage</h3>
                        <div className="text-white font-bold text-lg mt-0.5">
                            {used.toLocaleString()} / {limit.toLocaleString()} messages
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-800/50 rounded-full h-2 mb-3">
                    <div
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${percentage}%` }} // eslint-disable-line react-dom/no-unsafe-inline-style
                    />
                </div>

                <p className="text-xs text-slate-500">
                    {limit - used > 0 ? "You have plenty of messages left" : "You have reached your limit"}
                </p>
            </div>
        </div>
    );
}
