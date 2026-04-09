"use client";

import Sidebar from "@/components/dashboard/sidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            {/* Main content — offset by sidebar width, fills the viewport exactly */}
            <div className="flex-1 ml-[220px] h-screen overflow-y-auto transition-all duration-300">
                {children}
            </div>
        </div>
    );
}
