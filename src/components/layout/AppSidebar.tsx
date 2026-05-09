"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { useUser } from "@/context/UserContext";
import {
  BoxCubeIcon,
  GridIcon,
  ListIcon,
  UserCircleIcon,
} from "@/icons";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path: string;
};

const AppSidebar: React.FC = () => {
  const { user, loading } = useUser();
  console.log("USER:", user);
  const {
    isExpanded,
    isMobileOpen,
    isHovered,
    setIsHovered,
  } = useSidebar();
  const pathname = usePathname();

  const isActive = (path: string) => path === pathname;

  if (loading) return null;

  const getMenuByRole = (): NavItem[] => {
    if (!user) return [];

    switch (user.role?.toLowerCase()) {
      case "admin":
        return [
          { icon: <GridIcon />, name: "Dashboard", path: "/dashboard" },
          { icon: <UserCircleIcon />, name: "Santri", path: "/santri" },
          { icon: <ListIcon />, name: "Guru", path: "/guru" },
          { icon: <BoxCubeIcon />, name: "Keuangan", path: "/keuangan" },
        ];

      case "guru":
        return [
          { icon: <GridIcon />, name: "Dashboard", path: "/dashboard" },
          { icon: <UserCircleIcon />, name: "Santri", path: "/santri" },
        ];

      case "bendahara":
        return [
          { icon: <GridIcon />, name: "Dashboard", path: "/dashboard" },
          { icon: <BoxCubeIcon />, name: "Keuangan", path: "/keuangan" },
        ];

      default:
        return [];
    }
  };

  const menuItems = getMenuByRole();

  return (
    <aside
      className={`
    fixed top-0 left-0 z-50 h-screen bg-white border-r
    transition-all duration-300

    ${isExpanded || isHovered || isMobileOpen
          ? "w-[290px]"
          : "w-[90px]"
        }

    ${isMobileOpen
          ? "translate-x-0"
          : "-translate-x-full lg:translate-x-0"
        }
  `}
      onMouseEnter={() => {
        if (!isExpanded) {
          setIsHovered(true);
        }
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
    >
      {/* LOGO */}
      <div className="p-6">
        <Link href="/dashboard">
          {isExpanded || isHovered || isMobileOpen ? (
            <Image
              src="/images/logo/logo.svg"
              alt="logo"
              width={120}
              height={40}
            />
          ) : (
            <Image
              src="/images/logo/logo-icon.svg"
              alt="logo"
              width={40}
              height={40}
            />
          )}
        </Link>
      </div>

      {/* MENU */}
      <nav className="px-4">
        {(isExpanded || isHovered || isMobileOpen) && (
          <h2 className="text-xs text-gray-400 mb-4">
            Menu
          </h2>
        )}
        <ul className="flex flex-col gap-3">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.path}
                className={`flex items-center px-3 py-2 rounded-lg transition
                  ${!isExpanded && !isHovered
                    ? "justify-center"
                    : "gap-3"}
                  ${isActive(item.path)
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-100"}
                    `}
              >
                {item.icon}

                {(isExpanded || isHovered || isMobileOpen) && (
                  <span>{item.name}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* WIDGET */}
      {/* <div className="mt-auto p-4">
        <SidebarWidget />
      </div> */}
    </aside>
  );
};

export default AppSidebar;