"use client";

import React from "react";

import { SidebarProvider } from "@/context/SidebarContext";
import AppSidebar from "@/components/layout/AppSidebar";
import AppHeader from "@/components/layout/AppHeader";
import Backdrop from "@/components/layout/Backdrop";

import { useSidebar } from "@/context/SidebarContext";

function DashboardContent({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isExpanded, isHovered } = useSidebar();

    const mainContentMargin =
        isExpanded || isHovered
            ? "lg:ml-[290px]"
            : "lg:ml-[90px]";

    return (
        <div className="min-h-screen xl:flex">
            <AppSidebar />
            <Backdrop />

            <div
                className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
            >
                <AppHeader />

                <div className="p-4 md:p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <DashboardContent>
                {children}
            </DashboardContent>
        </SidebarProvider>
    );
}