"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { useUser } from "@/context/UserContext";
import { BoxCubeIcon, GridIcon, ListIcon, UserCircleIcon, UserIcon, TaskIcon, DollarLineIcon } from "@/icons";
import { GroupIcon } from "lucide-react";
import { DatabaseBackup } from "lucide-react";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path: string;
};

const AppSidebar: React.FC = () => {
  const { user, loading } = useUser();
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, toggleMobileSidebar } = useSidebar();
  const pathname = usePathname();

  const isActive = (path: string) => path === pathname;

  if (loading) return null;

  const getMenuByRole = (): NavItem[] => {
    if (!user) return [];
    switch (user.role?.toLowerCase()) {
      case "admin":
        return [
          { icon: <GridIcon />, name: "Dashboard", path: "/dashboard" },
          { icon: <UserCircleIcon />, name: "Kelola Santri", path: "/santri" },
          { icon: <ListIcon />, name: "Kelola Guru", path: "/guru" },
          { icon: <TaskIcon />, name: "Kategori Keuangan", path: "/kategori-keuangan", },
          { icon: <DollarLineIcon />, name: "Keuangan SPP", path: "/keuangan-spp" },
          { icon: <DollarLineIcon />, name: "Keuangan Pembangunan", path: "/keuangan-pembangunan" },
          { icon: <UserIcon />, name: "Kelola User", path: "/users" },
          { icon: <ListIcon />, name: "Absensi", path: "/absensi" },
          { icon: <GridIcon />, name: "Kelola Kelas", path: "/kelas", },
          { icon: <BoxCubeIcon />, name: "Kelola Aset", path: "/aset" },
          { icon: <TaskIcon />, name: "Activity Log", path: "/activity-logs" },
          { icon: <DatabaseBackup />, name: "Backup & Restore", path: "/backup-restore" },
        ];
      case "teacher":
        return [
          { icon: <GridIcon />, name: "Dashboard", path: "/dashboard" },
          { icon: <GridIcon />, name: "Kelas Saya", path: "/kelas" },
          { icon: <UserCircleIcon />, name: "Santri", path: "/santri" },
          { icon: <GroupIcon />, name: "Absensi", path: "/absensi" },
        ];
      case "treasurer":
        return [
          { icon: <GridIcon />, name: "Dashboard", path: "/dashboard" },
          { icon: <DollarLineIcon />, name: "Keuangan SPP", path: "/keuangan-spp" },
          { icon: <DollarLineIcon />, name: "Keuangan Pembangunan", path: "/keuangan-pembangunan" },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuByRole();
  const sidebarOpen = isExpanded || isHovered || isMobileOpen;
  const hideLogo = user?.tpq_id === 2;

  return (
    <>
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen
          bg-brand-200 border-r border-brand-300
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? "w-[280px] max-w-[82vw]" : "w-[90px]"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0"}
        `}
        onMouseEnter={() => { if (!isExpanded) setIsHovered(true); }}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center justify-between p-4 h-[65px]">
          <div className="flex items-center gap-3">
            {!hideLogo && (
              <Image
                src="/images/logo/logo-01.png"
                alt="logo"
                width={sidebarOpen ? 50 : 40}
                height={40}
                className="flex-shrink-0"
              />
            )}

            {sidebarOpen && (
              <div className="flex flex-col leading-tight overflow-hidden">
                <span className="text-sm font-bold text-gray-800 whitespace-nowrap truncate max-w-[180px]">
                  {user?.tpq?.name ?? "TPQ"}
                </span>
                <span className="text-xs text-gray-700 whitespace-nowrap">
                  Admin Panel
                </span>
              </div>
            )}
          </div>

          {isMobileOpen && (
            <button
              type="button"
              onClick={toggleMobileSidebar}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 border border-brand-300 text-gray-700 hover:bg-brand-400 xl:hidden"
              aria-label="Tutup sidebar"
            >
              ✕
            </button>
          )}
        </div>

        <hr className="border border-brand-300" />

        <nav className="px-3 mt-5">
          {sidebarOpen && (
            <h2 className="text-xs text-black mb-4 mt-2 px-1 uppercase tracking-wider">Menu</h2>
          )}
          <ul className="flex flex-col gap-1">
            {menuItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.path}
                  onClick={() => {
                    if (isMobileOpen) toggleMobileSidebar();
                  }}
                  className={`
                    flex items-center px-3 py-2.5 rounded-lg transition-colors
                    ${sidebarOpen ? "gap-3" : "justify-center"}
                    ${isActive(item.path)
                      ? "bg-brand-500 text-white"
                      : "text-gray-700 hover:bg-brand-300/50"}
                  `}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {sidebarOpen && (
                    <span className="text-sm font-medium whitespace-nowrap">{item.name}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default AppSidebar;
