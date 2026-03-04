"use client";

import Sidebar from "@/components/dashboard/sidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            {/* Main content — offset by sidebar width. Since sidebar can collapse, 
          we use a generous left margin and let it breathe. */}
            <div className="flex-1 ml-[220px] transition-all duration-300">
                {children}
            </div>
        </div>
    );
}
