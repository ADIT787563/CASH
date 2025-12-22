import { DashboardTopNav } from "@/components/dashboard/DashboardTopNav";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-transparent">
            <DashboardTopNav />
            {/* Adjusted padding for fixed top bar (h-14 = 3.5rem) */}
            <div className="pt-14 min-h-screen transition-all duration-300">
                <div className="p-4 md:p-8 max-w-[1800px] mx-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}
