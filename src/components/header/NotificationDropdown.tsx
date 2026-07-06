"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { getNotifications } from "@/services/notification";
import { useRouter } from "next/navigation";
import { NotifItem } from "@/types/notification";

type NotificationResponse = {
  data?: NotifItem[];
  unread?: number;
};

type Props = {
  isOpen?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
};

export default function NotificationDropdown({
  isOpen: controlledIsOpen,
  onToggle,
  onClose,
}: Props) {
  const [localIsOpen, setLocalIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const [unread, setUnread] = useState(0);
  const prevUnread = useRef(0);
  const isOpen = controlledIsOpen ?? localIsOpen;
  const router = useRouter();

  const showWindowsNotification = useCallback((count: number) => {
    if (!("Notification" in window) || Notification.permission !== "granted") {
      return;
    }

    new Notification("TPQ - Notifikasi Baru", {
      body: `Ada ${count} notifikasi belum dibaca`,
      icon: "/favicon.ico",
      tag: `tpq-notif-${count}-${Date.now()}`,
      silent: false,
    });
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      const res = (await getNotifications()) as NotificationResponse | NotifItem[] | undefined;
      const nextNotifications = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
          ? res.data
          : [];
      const newUnread =
        !Array.isArray(res) && typeof res?.unread === "number"
          ? res.unread
          : nextNotifications.filter((notif) => !notif.is_read).length;

      if (newUnread > prevUnread.current && prevUnread.current !== -1) {
        showWindowsNotification(newUnread);
      }

      prevUnread.current = newUnread;
      setNotifications(nextNotifications);
      setUnread(newUnread);
    } catch (err) {
      console.error("Gagal memuat notifikasi:", err);
      setNotifications([]);
      setUnread(0);
    }
  }, [showWindowsNotification]);

  useEffect(() => {
    prevUnread.current = -1;

    const timeout = window.setTimeout(() => {
      loadNotifications();
    }, 0);

    const interval = setInterval(() => {
      loadNotifications();
    }, 30000);

    const handleRefreshNotifications = () => {
      loadNotifications();
    };

    window.addEventListener("tpq:refresh-notifications", handleRefreshNotifications);

    return () => {
      window.clearTimeout(timeout);
      clearInterval(interval);
      window.removeEventListener("tpq:refresh-notifications", handleRefreshNotifications);
    };
  }, [loadNotifications]);

  const handleOpen = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }

    if (onToggle) {
      onToggle();
      return;
    }

    setLocalIsOpen((prev) => !prev);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
      return;
    }

    setLocalIsOpen(false);
  };

  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  const previewNotifications = safeNotifications.slice(0, 5);

  const goToNotificationPage = () => {
    handleClose();
    router.push("/notifikasi");
  };

  return (
    <div className="relative">
      <button
        className="relative dropdown-toggle flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-300 bg-brand-200 text-gray-500 transition-colors hover:bg-brand-100 hover:text-gray-800 sm:h-11 sm:w-11"
        onClick={handleOpen}
        aria-label="Buka notifikasi"
      >
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 z-10 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-orange-400 rounded-full">
            {unread > 9 ? "9+" : unread}
            <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
          </span>
        )}

        <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z" fill="currentColor" />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={handleClose}
        positionClassName="fixed inset-x-4 top-[72px] z-50 sm:absolute sm:inset-auto sm:right-0 sm:top-auto sm:mt-4"
        className="flex max-h-[calc(100vh-88px)] w-auto flex-col rounded-2xl p-3 sm:h-120 sm:w-90.25"
      >
        <div className="mb-3 flex items-center justify-between gap-3 border-b border-gray-100 pb-3 dark:border-gray-700">
          <h5 className="min-w-0 text-base font-semibold text-gray-800 dark:text-gray-200 sm:text-lg">
            Notifikasi
            {unread > 0 && (
              <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-600">
                {unread} baru
              </span>
            )}
          </h5>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
              <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>

        <ul className="custom-scrollbar flex h-auto flex-col overflow-y-auto">
          {safeNotifications.length === 0 && (
            <li className="py-8 text-center text-sm text-gray-400">
              Tidak ada notifikasi
            </li>
          )}

          {previewNotifications.map((notif) => (
            <li key={notif.id}>
              <DropdownItem
                onItemClick={goToNotificationPage}
                className={`flex gap-3 rounded-lg border-b border-gray-100 px-4 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5 ${!notif.is_read ? "bg-orange-50" : ""
                  }`}
              >
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 shrink-0">
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z" fill="#f97316" />
                  </svg>
                </span>

                <span className="block flex-1">
                  <span className={`mb-1 block break-words text-sm font-semibold ${!notif.is_read ? "text-gray-800 dark:text-white" : "text-gray-500"}`}>
                    {notif.title}
                  </span>
                  <span className="block break-words text-sm text-gray-500 dark:text-gray-400">
                    {notif.message}
                  </span>
                  <span className="mt-1 block text-xs text-gray-400">
                    {new Date(notif.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </span>

                {!notif.is_read && (
                  <span className="mt-1 w-2 h-2 rounded-full bg-orange-400 shrink-0" />
                )}
              </DropdownItem>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={goToNotificationPage}
          className="block w-full px-4 py-2 mt-3 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          Lihat Semua Notifikasi
        </button>
      </Dropdown>
    </div>
  );
}
