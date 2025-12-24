import { DashboardTopNav } from "@/components/dashboard/DashboardTopNav";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
            {/* Main Content Wrapper (No Sidebar) */}
            <div className="flex flex-col min-h-screen">

                {/* Top Navigation (Sticky) */}
                <DashboardTopNav />

                {/* Page Content */}
                <main className="flex-1 p-4 md:p-8 w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
