"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import React from "react";

interface BreadcrumbProps {
    pageTitle: string;
}

type BreadcrumbItem = {
    label: string;
    href?: string;
};

const routeLabels: Record<string, string> = {
    dashboard: "Dashboard",
    santri: "Santri",
    guru: "Guru",
    users: "Users",
    kelas: "Kelas",
    absensi: "Absensi",
    riwayat: "Riwayat",
    notifikasi: "Notifikasi",
    profile: "Profile",
    aset: "Aset",
    "activity-logs": "Activity Log",
    "kategori-keuangan": "Kategori Keuangan",
    "keuangan-spp": "Keuangan SPP",
    "keuangan-pembangunan": "Keuangan Pembangunan",
};

function getSegmentLabel(segment: string) {
    if (routeLabels[segment]) return routeLabels[segment];

    return segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function isDynamicSegment(segment: string) {
    return /^\d+$/.test(segment) || /^[0-9a-f-]{12,}$/i.test(segment);
}

function buildBreadcrumbItems(pathname: string, pageTitle: string): BreadcrumbItem[] {
    const segments = pathname.split("/").filter(Boolean);

    if (pathname === "/dashboard") {
        return [{ label: pageTitle }];
    }

    const items: BreadcrumbItem[] = [
        {
            label: "Dashboard",
            href: "/dashboard",
        },
    ];

    const actionIndex = segments.findIndex((segment) =>
        ["create", "edit"].includes(segment)
    );

    if (actionIndex >= 0) {
        const parentSegments = segments.slice(0, actionIndex);
        const parentHref = `/${parentSegments.join("/")}`;
        const parentSegment = parentSegments[parentSegments.length - 1];

        if (parentSegment) {
            items.push({
                label: getSegmentLabel(parentSegment),
                href: parentHref,
            });
        }

        items.push({ label: pageTitle });
        return items;
    }

    const navigableSegments = segments.filter(
        (segment) => !isDynamicSegment(segment)
    );

    navigableSegments.forEach((segment, index) => {
        const href = `/${navigableSegments.slice(0, index + 1).join("/")}`;
        const isLast = index === navigableSegments.length - 1;

        items.push({
            label: isLast ? pageTitle : getSegmentLabel(segment),
            href: isLast ? undefined : href,
        });
    });

    return items;
}

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({ pageTitle }) => {
    const pathname = usePathname();
    const items = buildBreadcrumbItems(pathname, pageTitle);

    return (
        <div className="mb-6">
            <div>
                <h2 className="text-xl font-semibold text-gray-800">
                    {pageTitle}
                </h2>

                <nav className="mt-2" aria-label="Breadcrumb">
                    <ol className="flex flex-wrap items-center gap-1.5 text-sm">
                        {items.map((item, index) => {
                            const isFirst = index === 0;
                            const isLast = index === items.length - 1;

                            return (
                                <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
                                    {index > 0 && (
                                        <ChevronRight className="h-4 w-4 text-gray-400" />
                                    )}

                                    {item.href && !isLast ? (
                                        <Link
                                            href={item.href}
                                            className="inline-flex items-center gap-1 text-gray-500 hover:text-brand-600"
                                        >
                                            {isFirst && <Home className="h-4 w-4" />}
                                            <span>{item.label}</span>
                                        </Link>
                                    ) : (
                                        <span className="font-medium text-gray-800">
                                            {item.label}
                                        </span>
                                    )}
                                </li>
                            );
                        })}
                    </ol>
                </nav>
            </div>
        </div>
    );
};

export default PageBreadcrumb;
