"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { useUser } from "@/context/UserContext";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCog,
  BookOpenCheck,
  ClipboardCheck,
  Tags,
  Wallet,
  Landmark,
  Package,
  Activity,
  DatabaseBackup,
} from "lucide-react";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path: string;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const iconSize = 20;

const AppSidebar: React.FC = () => {
  const { user, loading } = useUser();
  const {
    isExpanded,
    isMobileOpen,
    isHovered,
    setIsHovered,
    toggleMobileSidebar,
  } = useSidebar();

  const pathname = usePathname();

  const sidebarOpen = isExpanded || isHovered || isMobileOpen;
  const hideLogo = user?.tpq_id === 2;

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  if (loading) return null;

  const getMenuByRole = (): NavGroup[] => {
    if (!user) return [];

    switch (user.role?.toLowerCase()) {
      case "admin":
        return [
          {
            title: "Utama",
            items: [
              {
                icon: <LayoutDashboard size={iconSize} />,
                name: "Dashboard",
                path: "/dashboard",
              },
            ],
          },
          {
            title: "Master Data",
            items: [
              {
                icon: <Users size={iconSize} />,
                name: "Kelola Santri",
                path: "/santri",
              },
              {
                icon: <GraduationCap size={iconSize} />,
                name: "Kelola Guru",
                path: "/guru",
              },
              {
                icon: <UserCog size={iconSize} />,
                name: "Kelola User",
                path: "/users",
              },
              {
                icon: <BookOpenCheck size={iconSize} />,
                name: "Kelola Kelas",
                path: "/kelas",
              },
            ],
          },
          {
            title: "Keuangan",
            items: [
              {
                icon: <Tags size={iconSize} />,
                name: "Kategori Keuangan",
                path: "/kategori-keuangan",
              },
              {
                icon: <Wallet size={iconSize} />,
                name: "Keuangan SPP",
                path: "/keuangan-spp",
              },
              {
                icon: <Landmark size={iconSize} />,
                name: "Keuangan Pembangunan",
                path: "/keuangan-pembangunan",
              },
            ],
          },
          {
            title: "Aktivitas",
            items: [
              {
                icon: <ClipboardCheck size={iconSize} />,
                name: "Absensi",
                path: "/absensi/riwayat",
              },
              {
                icon: <Tags size={iconSize} />,
                name: "Kategori Aset",
                path: "/kategori-aset",
              },
              {
                icon: <Package size={iconSize} />,
                name: "Kelola Aset",
                path: "/aset",
              },
              {
                icon: <Activity size={iconSize} />,
                name: "Activitas Log",
                path: "/activity-logs",
              },
            ],
          },
          {
            title: "Sistem",
            items: [
              {
                icon: <DatabaseBackup size={iconSize} />,
                name: "Backup & Restore",
                path: "/backup-restore",
              },
            ],
          },
        ];

      case "teacher":
        return [
          {
            title: "Utama",
            items: [
              {
                icon: <LayoutDashboard size={iconSize} />,
                name: "Dashboard",
                path: "/dashboard",
              },
            ],
          },
          {
            title: "Pembelajaran",
            items: [
              {
                icon: <BookOpenCheck size={iconSize} />,
                name: "Kelas Saya",
                path: "/kelas",
              },
              {
                icon: <Users size={iconSize} />,
                name: "Santri",
                path: "/santri",
              },
              {
                icon: <ClipboardCheck size={iconSize} />,
                name: "Absensi",
                path: "/absensi",
              },
            ],
          },
        ];

      case "treasurer":
        return [
          {
            title: "Utama",
            items: [
              {
                icon: <LayoutDashboard size={iconSize} />,
                name: "Dashboard",
                path: "/dashboard",
              },
            ],
          },
          {
            title: "Keuangan",
            items: [
              {
                icon: <Wallet size={iconSize} />,
                name: "Keuangan SPP",
                path: "/keuangan-spp",
              },
              {
                icon: <Landmark size={iconSize} />,
                name: "Keuangan Pembangunan",
                path: "/keuangan-pembangunan",
              },
            ],
          },
        ];

      default:
        return [];
    }
  };

  const menuGroups = getMenuByRole();

  return (
    <aside
      className={`
        fixed left-0 top-0 z-50 h-screen
        border-r border-brand-300 bg-brand-200
        transition-all duration-300 ease-in-out
        ${sidebarOpen ? "w-[280px] max-w-[82vw]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0"}
      `}
      onMouseEnter={() => {
        if (!isExpanded) setIsHovered(true);
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header Logo */}
      <div className="flex h-[74px] items-center justify-between px-4">
        <div
          className={`flex min-w-0 items-center ${sidebarOpen ? "gap-3" : "justify-center"
            }`}
        >
          {!hideLogo && (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/70 shadow-sm">
              <Image
                src="/images/logo/logo-01.png"
                alt="logo"
                width={44}
                height={44}
                className="h-11 w-11 object-contain"
              />
            </div>
          )}

          {sidebarOpen && (
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-bold text-slate-800">
                {user?.tpq?.name ?? "TPQ"}
              </p>
              <p className="mt-0.5 truncate text-xs font-medium text-slate-600">
                Admin Panel
              </p>
            </div>
          )}
        </div>

        {isMobileOpen && (
          <button
            type="button"
            onClick={toggleMobileSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/50 text-slate-700 hover:bg-white xl:hidden"
            aria-label="Tutup sidebar"
          >
            ✕
          </button>
        )}
      </div>

      <div className="h-px bg-brand-300" />

      {/* Menu */}
      <nav className="custom-scrollbar h-[calc(100vh-75px)] overflow-y-auto px-3 py-4">
        {menuGroups.map((group, groupIndex) => (
          <div key={group.title} className={groupIndex === 0 ? "" : "mt-5"}>
            {sidebarOpen && (
              <h2 className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                {group.title}
              </h2>
            )}

            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(item.path);

                return (
                  <li key={item.name}>
                    <Link
                      href={item.path}
                      title={!sidebarOpen ? item.name : undefined}
                      onClick={() => {
                        if (isMobileOpen) toggleMobileSidebar();
                      }}
                      className={`
                        group flex min-h-11 items-center rounded-xl px-3 text-sm transition-all
                        ${sidebarOpen ? "gap-3" : "justify-center"}
                        ${active
                          ? "bg-brand-500 font-semibold text-white shadow-sm"
                          : "font-medium text-slate-700 hover:bg-white/40 hover:text-brand-700"
                        }
                      `}
                    >
                      <span
                        className={`
                          flex h-6 w-6 shrink-0 items-center justify-center
                          ${active ? "text-white" : "text-slate-700 group-hover:text-brand-700"}
                        `}
                      >
                        {item.icon}
                      </span>

                      {sidebarOpen && (
                        <span className="truncate whitespace-nowrap">
                          {item.name}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default AppSidebar;