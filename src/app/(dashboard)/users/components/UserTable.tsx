"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { getUsers, deleteUser } from "@/services/user";
import { User } from "@/types/user";
import { useRouter } from "next/navigation";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";
import Pagination from "@/components/ui/pagination/Pagination";
import SortableHeader, {
    SortDirection,
} from "@/components/ui/table/SortableHeader";

type Props = {
    search: string;
};

export default function UserTable({ search }: Props) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);

    const { toast, showToast, hideToast } = useToast();
    const router = useRouter();

    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        id: number | null;
        nama: string;
    }>({
        show: false,
        id: null,
        nama: "",
    });

    const handleSort = (key: string, direction: SortDirection) => {
        setSortKey(direction ? key : null);
        setSortDirection(direction);
        setCurrentPage(1);
    };

    const handleDeleteClick = (id: number, nama: string) => {
        setDeleteModal({ show: true, id, nama });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteModal.id) return;

        try {
            await deleteUser(deleteModal.id);

            setUsers((prev) =>
                prev.filter((item) => item.id !== deleteModal.id)
            );

            showToast(
                `Data user ${deleteModal.nama} berhasil dihapus!`,
                "success"
            );

            setDeleteModal({
                show: false,
                id: null,
                nama: "",
            });
        } catch (error) {
            console.error(error);
            showToast("Gagal menghapus data user", "error");
        }
    };

    const filteredData = users.filter((user) => {
        const keyword = search.toLowerCase();

        const roleText =
            user.role === "admin"
                ? "admin"
                : user.role === "teacher"
                ? "guru"
                : user.role === "treasurer"
                ? "bendahara"
                : user.role;

        const statusText =
            user.status === "active"
                ? "aktif"
                : user.status === "inactive"
                ? "nonaktif"
                : user.status;

        return (
            user.name.toLowerCase().includes(keyword) ||
            user.username.toLowerCase().includes(keyword) ||
            (user.email || "").toLowerCase().includes(keyword) ||
            user.role.toLowerCase().includes(keyword) ||
            user.status.toLowerCase().includes(keyword) ||
            roleText.toLowerCase().includes(keyword) ||
            statusText.toLowerCase().includes(keyword)
        );
    });

    const sortedData = [...filteredData].sort((a, b) => {
        if (!sortKey || !sortDirection) return 0;

        const getValue = (item: User) => {
            if (sortKey === "name") return item.name || "";
            if (sortKey === "username") return item.username || "";
            if (sortKey === "email") return item.email || "";

            if (sortKey === "role") {
                if (item.role === "admin") return "Admin";
                if (item.role === "teacher") return "Guru";
                if (item.role === "treasurer") return "Bendahara";
                return item.role || "";
            }

            if (sortKey === "status") {
                if (item.status === "active") return "Aktif";
                if (item.status === "inactive") return "Nonaktif";
                return item.status || "";
            }

            return "";
        };

        const valueA = String(getValue(a)).toLowerCase();
        const valueB = String(getValue(b)).toLowerCase();

        const compare = valueA.localeCompare(valueB, "id", {
            numeric: true,
            sensitivity: "base",
        });

        return sortDirection === "asc" ? compare : -compare;
    });

    const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const pageStart = (safeCurrentPage - 1) * pageSize;
    const paginatedData = sortedData.slice(pageStart, pageStart + pageSize);

    useEffect(() => {
        async function fetchUsers() {
            try {
                const data = await getUsers();
                setUsers(data);
            } catch (error) {
                console.error("Gagal ambil user:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchUsers();
    }, []);

    if (loading) return <p>Loading data user...</p>;

    return (
        <>
            {deleteModal.show && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() =>
                            setDeleteModal({
                                show: false,
                                id: null,
                                nama: "",
                            })
                        }
                    />

                    <div className="relative z-10 w-full max-w-sm mx-4 bg-white rounded-2xl shadow-xl p-6 dark:bg-gray-900">
                        <div className="flex items-center justify-center w-14 h-14 mx-auto mb-4 rounded-full bg-red-100">
                            <svg
                                width="28"
                                height="28"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M3 6H5H21"
                                    stroke="#ef4444"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M8 6V4C8 3.448 8.448 3 9 3H15C15.552 3 16 3.448 16 4V6M19 6L18.132 19.142C18.058 20.178 17.195 21 16.157 21H7.843C6.805 21 5.942 20.178 5.868 19.142L5 6H19Z"
                                    stroke="#ef4444"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>

                        <h4 className="text-center text-lg font-semibold text-gray-800 dark:text-white">
                            Hapus Data User?
                        </h4>

                        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Apakah kamu yakin ingin menghapus data user{" "}
                            <span className="font-semibold text-gray-700 dark:text-gray-200">
                                {deleteModal.nama}
                            </span>
                            ? Tindakan ini tidak dapat dibatalkan.
                        </p>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() =>
                                    setDeleteModal({
                                        show: false,
                                        id: null,
                                        nama: "",
                                    })
                                }
                                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                Batal
                            </button>

                            <button
                                onClick={handleDeleteConfirm}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-sm font-medium text-white hover:bg-red-600"
                            >
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
                <div className="max-w-full overflow-x-auto">
                    <div className="min-w-[1050px]">
                        <Table>
                            <TableHeader className="border-b border-brand-300 bg-brand-100">
                                <TableRow>
                                    <TableCell
                                        isHeader
                                        className="px-4 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400"
                                    >
                                        No
                                    </TableCell>

                                    <TableCell
                                        isHeader
                                        className="px-4 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400"
                                    >
                                        <SortableHeader
                                            label="Nama User"
                                            sortKey="name"
                                            activeKey={sortKey}
                                            direction={sortDirection}
                                            onSort={handleSort}
                                        />
                                    </TableCell>

                                    <TableCell
                                        isHeader
                                        className="px-4 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400"
                                    >
                                        <SortableHeader
                                            label="Username"
                                            sortKey="username"
                                            activeKey={sortKey}
                                            direction={sortDirection}
                                            onSort={handleSort}
                                        />
                                    </TableCell>

                                    <TableCell
                                        isHeader
                                        className="px-4 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400"
                                    >
                                        <SortableHeader
                                            label="Email"
                                            sortKey="email"
                                            activeKey={sortKey}
                                            direction={sortDirection}
                                            onSort={handleSort}
                                        />
                                    </TableCell>

                                    <TableCell
                                        isHeader
                                        className="px-4 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400"
                                    >
                                        <SortableHeader
                                            label="Role"
                                            sortKey="role"
                                            activeKey={sortKey}
                                            direction={sortDirection}
                                            onSort={handleSort}
                                        />
                                    </TableCell>

                                    <TableCell
                                        isHeader
                                        className="px-4 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400"
                                    >
                                        <SortableHeader
                                            label="Status"
                                            sortKey="status"
                                            activeKey={sortKey}
                                            direction={sortDirection}
                                            onSort={handleSort}
                                        />
                                    </TableCell>

                                    <TableCell
                                        isHeader
                                        className="px-4 py-3 font-semibold text-black text-start text-theme-xs dark:text-gray-400"
                                    >
                                        Aksi
                                    </TableCell>
                                </TableRow>
                            </TableHeader>

                            <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                                {sortedData.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="px-4 py-6 text-center text-gray-500 text-theme-sm"
                                        >
                                            Data user tidak ditemukan
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedData.map((user, index) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                {pageStart + index + 1}
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                {user.name}
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                {user.username}
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                {user.email || "-"}
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                                                    {user.role === "admin"
                                                        ? "Admin"
                                                        : user.role === "teacher"
                                                        ? "Guru"
                                                        : user.role === "treasurer"
                                                        ? "Bendahara"
                                                        : user.role}
                                                </span>
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                                <span
                                                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                                                        user.status === "active"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-700"
                                                    }`}
                                                >
                                                    {user.status === "active"
                                                        ? "Aktif"
                                                        : "Nonaktif"}
                                                </span>
                                            </TableCell>

                                            <TableCell className="px-4 py-3 text-theme-sm">
                                                <button
                                                    onClick={() =>
                                                        router.push(`/users/edit/${user.id}`)
                                                    }
                                                    className="text-blue-500 hover:underline text-sm"
                                                >
                                                    Edit
                                                </button>

                                                <span className="mx-1 font-semibold text-gray-300">
                                                    |
                                                </span>

                                                <button
                                                    onClick={() =>
                                                        handleDeleteClick(user.id, user.name)
                                                    }
                                                    className="text-red-500 hover:underline text-sm"
                                                >
                                                    Hapus
                                                </button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <Pagination
                    totalItems={sortedData.length}
                    currentPage={safeCurrentPage}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                />
            </div>

            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={hideToast}
                />
            )}
        </>
    );
}