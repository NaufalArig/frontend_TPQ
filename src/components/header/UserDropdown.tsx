"use client";

import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useUser } from "@/context/UserContext";
import { logout } from "@/services/auth";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { user, setUser } = useUser();

  function toggleDropdown(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  async function handleLogout() {
    try {
      setLoading(true);

      await logout();

      setUser(null);

      closeDropdown();

      router.push("/login");
    } catch (error) {
      console.error("Logout gagal:", error);
      alert("Logout gagal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dropdown-toggle"
      >
        <span className="mr-3 overflow-hidden rounded-full h-11 w-11">
          <Image
            width={44}
            height={44}
            src="/images/user/owner.jpg"
            alt="User"
          />
        </span>

        <span className="block mr-1 font-medium text-theme-sm">
          {user?.name || "User"}
        </span>

        <svg
          className={`stroke-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
            }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-4 flex w-65 flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-lg"
      >
        <div>
          <span className="block font-medium text-gray-700 text-theme-sm">
            {user?.name || "User"}
          </span>
          <span className="mt-0.5 block text-theme-xs text-gray-500">
            {user?.email || "-"}
          </span>
        </div>

        <ul className="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/profile"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg hover:bg-gray-100"
            >
              Edit Profile
            </DropdownItem>
          </li>
        </ul>

        <button
          onClick={handleLogout}
          disabled={loading}
          className="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-red-600 rounded-lg hover:bg-red-50 text-left"
        >
          {loading ? "Logging out..." : "Sign out"}
        </button>
      </Dropdown>
    </div>
  );
}