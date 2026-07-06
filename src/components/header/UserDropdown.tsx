"use client";

import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useUser } from "@/context/UserContext";
import { logout } from "@/services/auth";
import { DEFAULT_USER_PHOTO, getStorageUrl } from "@/lib/storage";
import ModalPortal from "@/components/ui/modal/ModalPortal";

type Props = {
  isOpen?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
};

export default function UserDropdown({
  isOpen: controlledIsOpen,
  onToggle,
  onClose,
}: Props) {
  const [localIsOpen, setLocalIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showLogoutSuccess, setShowLogoutSuccess] = useState(false);

  const router = useRouter();
  const { user, setUser } = useUser();
  const isOpen = controlledIsOpen ?? localIsOpen;
  const photoUrl = getStorageUrl(user?.photo);

  function toggleDropdown(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation();
    if (onToggle) {
      onToggle();
      return;
    }

    setLocalIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    if (onClose) {
      onClose();
      return;
    }

    setLocalIsOpen(false);
  }

  function handleLogoutClick() {
    closeDropdown();
    setShowModal(true);
  }

  async function handleLogoutConfirm() {
    try {
      setLoading(true);
      await logout();
      setUser(null);
      setShowModal(false);

      setShowLogoutSuccess(true);

      setTimeout(() => {
        router.push("/login");
      }, 1000);

    } catch (error) {
      console.error("Logout gagal:", error);
      alert("Logout gagal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {showLogoutSuccess && (
        <ModalPortal>
          <div className="fixed inset-0 z-[99999] isolate flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            {/* Modal */}
            <div className="relative z-10 flex flex-col items-center bg-white rounded-2xl shadow-2xl px-10 py-8 mx-4"
              style={{ animation: "fadeScaleIn 0.3s ease-out" }}
            >
              {/* Icon */}
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
                <svg
                  className="w-10 h-10 text-green-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 13L9 17L19 7"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="24"
                    strokeDashoffset="0"
                    style={{ animation: "dash 0.5s ease-out 0.2s both" }}
                  />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-1">
                Logout Berhasil!
              </h3>
              <p className="text-sm text-gray-500 mb-5">
                Sampai jumpa,{" "}
                <span className="font-semibold text-gray-700">
                  {user?.name || ""}
                </span>
              </p>

              {/* Loading bar */}
              <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ animation: "loadBar 1s linear forwards" }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Mengalihkan ke halaman login...
              </p>
            </div>
          </div>
        </ModalPortal>
      )}

      {showModal && (
        <ModalPortal>
          <div className="fixed inset-0 z-[99999] isolate flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowModal(false)}
            />

            <div className="relative z-10 w-full max-w-sm mx-4 bg-white rounded-2xl shadow-xl p-6 dark:bg-gray-900">
              <div className="flex items-center justify-center w-14 h-14 mx-auto mb-4 rounded-full bg-red-100">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 12H3M3 12L7 8M3 12L7 16" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 7.416V6C9 4.895 9.895 4 11 4H19C20.105 4 21 4.895 21 6V18C21 19.105 20.105 20 19 20H11C9.895 20 9 19.105 9 18V16.584" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>

              <h4 className="text-center text-lg font-semibold text-gray-800 dark:text-white">
                Keluar dari Akun?
              </h4>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                Apakah kamu yakin ingin keluar dari akun ini?
              </p>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-500 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Batal
                </button>
                <button
                  onClick={handleLogoutConfirm}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-70"
                >
                  {loading ? "Keluar..." : "Ya, Keluar"}
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      <div className="relative">
        <button
          onClick={toggleDropdown}
          className="dropdown-toggle flex h-10 max-w-[52vw] shrink-0 items-center rounded-full border border-brand-300 bg-brand-200 text-gray-700 hover:bg-brand-100 sm:h-11 sm:max-w-none"
          aria-label="Buka menu profil"
        >
          <span className="ml-1 h-9 w-9 shrink-0 overflow-hidden rounded-full p-1 sm:h-11 sm:w-11">
            <Image
              width={44}
              height={44}
              className="h-full w-full rounded-full object-cover"
              src={photoUrl}
              alt="User"
              onError={(event) => {
                event.currentTarget.src = DEFAULT_USER_PHOTO;
              }}
            />
          </span>
          <span className="hidden max-w-32 truncate p-1 text-theme-sm font-medium sm:block lg:max-w-44">
            {user?.name || "User"}
          </span>
          <svg
            className={`mr-2 hidden stroke-gray-500 transition-transform duration-200 sm:block ${isOpen ? "rotate-180" : ""}`}
            width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M4.3125 8.65625L9 13.3437L13.6875 8.65625" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <Dropdown
          isOpen={isOpen}
          onClose={closeDropdown}
          positionClassName="fixed right-4 top-[72px] z-50 sm:absolute sm:right-0 sm:top-auto sm:mt-4"
          className="flex w-[calc(100vw-2rem)] max-w-65 flex-col rounded-2xl p-3 shadow-lg dark:bg-gray-900 sm:w-65"
        >
          <div>
            <span className="hidden max-w-32 truncate px-2 text-left sm:block lg:max-w-44">
              <span className="block truncate text-theme-sm font-medium">
                {user?.name || "User"}
              </span>
              <span className="block truncate text-[11px] text-gray-500">
                {user?.tpq?.name ?? "TPQ"}
              </span>
              <span className="mt-0.5 block text-[11px] text-gray-400 capitalize">
              {user?.role ?? "-"}
            </span>
            </span>
          </div>

          <ul className="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200 dark:border-gray-700">
            <li>
              <DropdownItem
                onItemClick={closeDropdown}
                tag="a"
                href="/profile"
                className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Edit Profile
              </DropdownItem>
            </li>
          </ul>

          <button
            onClick={handleLogoutClick}
            className="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-red-600 rounded-lg hover:bg-red-50 text-left dark:hover:bg-red-900/20"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 12H3M3 12L7 8M3 12L7 16" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 7.416V6C9 4.895 9.895 4 11 4H19C20.105 4 21 4.895 21 6V18C21 19.105 20.105 20 19 20H11C9.895 20 9 19.105 9 18V16.584" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            Keluar
          </button>
        </Dropdown>
      </div>
    </>
  );
}
