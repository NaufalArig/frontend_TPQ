"use client";

import React from "react";
import { SidebarProvider } from "@/context/SidebarContext";
import AppSidebar from "@/components/layout/AppSidebar";
import AppHeader from "@/components/layout/AppHeader";
import Backdrop from "@/components/layout/Backdrop";
import { useSidebar } from "@/context/SidebarContext";

function DashboardContent({ children }: { children: React.ReactNode }) {
    const { isExpanded, isHovered } = useSidebar();

    const mainContentMargin =
        isExpanded || isHovered ? "xl:ml-[280px]" : "xl:ml-[90px]";

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <AppSidebar />
            <Backdrop />

            <div className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out ${mainContentMargin}`}>
                <AppHeader />
                <main className="flex-1 p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <DashboardContent>
                {children}
            </DashboardContent>
        </SidebarProvider>
    );
}