import { DashboardTopNav } from "@/components/dashboard/DashboardTopNav";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-zinc-50">
            {/* 1. Fixed Sidebar */}
            <DashboardSidebar />

            {/* 2. Main Content Wrapper (shifted right by sidebar width) */}
            <div className="pl-64 flex flex-col min-h-screen transition-all duration-300">

                {/* 3. Top Navigation */}
                <DashboardTopNav />

                {/* 4. Page Content */}
                <main className="flex-1 p-8 max-w-[1600px] mx-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
