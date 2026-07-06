"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getDashboardStats } from "@/services/dashboard";
import { DashboardStats, FinanceChart } from "@/types/dashboard";
import { BoxIconLine, GroupIcon } from "@/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useUser } from "@/context/UserContext";
import API_URL from "@/lib/api";
import Toast from "@/components/ui/toast/Toast";
import { useToast } from "@/hooks/useToast";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value || 0);
}

function formatTanggal(value?: string | null) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function FinanceChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    dataKey?: string | number;
    name?: string;
    value?: unknown;
    payload?: FinanceChart;
  }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const row = payload[0]?.payload;
  const tuition = Number(row?.tuition ?? 0);
  const developmentFund = Number(row?.development_fund ?? 0);

  if (tuition <= 0 && developmentFund <= 0) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm">
      <p className="mb-2 font-medium text-gray-800">{label}</p>
      {payload.map((item) => {
        const amount = Number(item.value ?? 0);

        if (amount <= 0) return null;

        return (
          <p
            key={String(item.dataKey)}
            className={
              item.dataKey === "tuition" ? "text-green-600" : "text-blue-600"
            }
          >
            {item.name}: {formatRupiah(amount)}
          </p>
        );
      })}
    </div>
  );
}

function getToken() {
  if (typeof document === "undefined") return null;
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
}


export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const router = useRouter();
  const { user } = useUser();
  const [activateTarget, setActivateTarget] = useState<import("@/types/dashboard").PendingStudent | null>(null);
  const [activating, setActivating] = useState(false);
  const [activateError, setActivateError] = useState<string | null>(null);
  const { toast, showToast, hideToast } = useToast();

  const handleActivate = async () => {
    if (!activateTarget) return;
    setActivating(true);
    setActivateError(null);

    try {
      const token = getToken();

      const res = await fetch(`${API_URL}/santri/${activateTarget.id}/activate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Gagal mengaktifkan santri");
      }

      setActivateTarget(null);
      await loadDashboardStats();
      window.dispatchEvent(new Event("tpq:refresh-notifications"));
      showToast(`${activateTarget.name} berhasil diaktifkan!`, "success");

    } catch (err: unknown) {
      setActivateError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setActivating(false);
    }
  };

  const loadDashboardStats = useCallback(async () => {
    const data = await getDashboardStats();
    setStats(data);
  }, []);

  const financeChartData = useMemo(() => {
    return (stats?.finance_chart ?? []).slice(-4).reverse();
  }, [stats?.finance_chart]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadDashboardStats();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [loadDashboardStats]);

  if (!stats) return <div className="p-4 sm:p-6">Loading...</div>;

  if (stats.role === "teacher") {
    const teacherDashboard = stats.teacher_dashboard;

    return (
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Dashboard Guru
          </h1>
          <p className="text-sm text-gray-500">
            Selamat datang, {user?.name}. Berikut ringkasan kelas yang kamu ajar.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <span className="text-sm text-gray-500">Kelas Diajar</span>
            <h4 className="mt-2 text-2xl font-bold text-gray-800">
              {teacherDashboard?.total_classes ?? 0}
            </h4>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <span className="text-sm text-gray-500">Santri di Kelas Saya</span>
            <h4 className="mt-2 text-2xl font-bold text-gray-800">
              {teacherDashboard?.total_students ?? 0}
            </h4>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <span className="text-sm text-gray-500">Absensi Terbaru</span>
            <h4 className="mt-2 text-2xl font-bold text-gray-800">
              {teacherDashboard?.latest_attendances?.length ?? 0}
            </h4>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h5 className="font-semibold text-gray-800">Kelas yang Diajar</h5>
              <button
                onClick={() => router.push("/kelas")}
                className="text-xs text-blue-500 hover:underline"
              >
                Lihat kelas
              </button>
            </div>

            {(teacherDashboard?.classes ?? []).length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-400">
                Belum ada kelas yang diajar
              </p>
            ) : (
              <div className="space-y-3">
                {(teacherDashboard?.classes ?? []).map((kelas) => (
                  <div
                    key={kelas.id}
                    className="rounded-xl border border-gray-100 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h6 className="font-semibold text-gray-800">
                          {kelas.name}
                        </h6>
                        <p className="text-xs text-gray-500">
                          {kelas.description || "Tidak ada deskripsi"}
                        </p>
                      </div>

                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                        {kelas.students_count} santri
                      </span>
                    </div>

                    <div className="mt-3">
                      <p className="mb-2 text-xs font-medium text-gray-500">
                        Santri:
                      </p>

                      {(kelas.santris ?? []).length === 0 ? (
                        <p className="text-xs text-gray-400">
                          Belum ada santri di kelas ini
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {(kelas.santris ?? []).slice(0, 6).map((santri) => (
                            <span
                              key={santri.id}
                              className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700"
                            >
                              {santri.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h5 className="font-semibold text-gray-800">Absensi Terkini</h5>
              <button
                onClick={() => router.push("/absensi")}
                className="text-xs text-blue-500 hover:underline"
              >
                Buka absensi
              </button>
            </div>

            {(teacherDashboard?.latest_attendances ?? []).length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-400">
                Belum ada data absensi
              </p>
            ) : (
              <div className="space-y-3">
                {(teacherDashboard?.latest_attendances ?? []).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-gray-100 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {item.student?.name ?? "-"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.student?.study_class?.name ?? "-"} •{" "}
                        {formatTanggal(item.attendance_date)}
                      </p>
                    </div>

                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (stats.role === "treasurer") {
    const financeDashboard = stats.finance_dashboard;
    const chartData = (financeDashboard?.finance_chart ?? []).slice(-4).reverse();

    return (
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Dashboard Bendahara
          </h1>
          <p className="text-sm text-gray-500">
            Ringkasan saldo dan transaksi terbaru.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
            <span className="text-sm text-green-600">SPP Bulan Ini</span>
            <h4 className="mt-2 break-all text-xl font-bold text-green-700">
              {formatRupiah(financeDashboard?.tuition_this_month ?? 0)}
            </h4>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <span className="text-sm text-blue-600">
              Saldo Pembangunan Bulan Ini
            </span>
            <h4 className="mt-2 break-all text-xl font-bold text-blue-700">
              {formatRupiah(financeDashboard?.development_fund_this_month ?? 0)}
            </h4>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <span className="text-sm text-emerald-600">Saldo Bulan Ini</span>
            <h4 className="mt-2 break-all text-xl font-bold text-emerald-700">
              {formatRupiah(financeDashboard?.income_this_month ?? 0)}
            </h4>
          </div>

          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
            <span className="text-sm text-indigo-600">Total Saldo</span>
            <h4 className="mt-2 break-all text-xl font-bold text-indigo-700">
              {formatRupiah(financeDashboard?.total_income ?? 0)}
            </h4>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h5 className="font-semibold text-gray-800">
                Transaksi Terbaru
              </h5>

              <div className="flex gap-2">
                <button
                  onClick={() => router.push("/keuangan-spp")}
                  className="text-xs text-blue-500 hover:underline"
                >
                  SPP
                </button>
                <button
                  onClick={() => router.push("/keuangan-pembangunan")}
                  className="text-xs text-blue-500 hover:underline"
                >
                  Pembangunan
                </button>
              </div>
            </div>

            {(financeDashboard?.latest_transactions ?? []).length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-400">
                Belum ada transaksi
              </p>
            ) : (
              <div className="space-y-3">
                {(financeDashboard?.latest_transactions ?? []).map((t) => (
                  <div
                    key={`${t.type}-${t.id}`}
                    className="flex items-center justify-between rounded-xl border border-gray-100 p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-800">
                        {t.type === "tuition"
                          ? `SPP ${t.student?.name || "-"}`
                          : t.financial_category?.name || "Pembangunan"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTanggal(t.payment_date)}
                      </p>
                    </div>

                    <span
                      className={`whitespace-nowrap text-sm font-semibold ${t.transaction_type === "expense"
                        ? "text-red-600"
                        : "text-gray-800"
                        }`}
                    >
                      {t.transaction_type === "expense" ? "- " : ""}
                      {formatRupiah(t.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h5 className="mb-4 font-semibold text-gray-800">
              Grafik Keuangan 4 Bulan Terakhir
            </h5>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month_label" tick={{ fontSize: 10 }} />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    width={52}
                    tickFormatter={(v) =>
                      new Intl.NumberFormat("id-ID", {
                        notation: "compact",
                        compactDisplay: "short",
                      }).format(Number(v || 0))
                    }
                  />
                  <Tooltip
                    content={<FinanceChartTooltip />}
                    cursor={false}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Bar dataKey="tuition" name="SPP" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="development_fund" name="Pembangunan" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 sm:gap-4 md:gap-6">
        {/* Total Santri */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl">
            <GroupIcon className="text-blue-600 size-5 sm:size-6" />
          </div>

          <div className="mt-4 sm:mt-5">
            <span className="text-xs sm:text-sm text-gray-500">
              Total Santri
            </span>
            <h4 className="mt-1 sm:mt-2 font-bold text-gray-800 text-lg sm:text-title-sm">
              {stats.total_students}
            </h4>
            <p className="mt-1 text-xs text-gray-400">
              Aktif: {stats.active_students} | Pending: {stats.pending_students}
            </p>
          </div>
        </div>

        {/* Total Guru */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl">
            <BoxIconLine className="text-purple-600" />
          </div>

          <div className="mt-4 sm:mt-5">
            <span className="text-xs sm:text-sm text-gray-500">
              Total Guru
            </span>
            <h4 className="mt-1 sm:mt-2 font-bold text-gray-800 text-lg sm:text-title-sm">
              {stats.total_teachers}
            </h4>
            <p className="mt-1 text-xs text-gray-400">
              Aktif: {stats.active_teachers} | Pending: {stats.pending_teachers}
            </p>
          </div>
        </div>

        {/* Total Kelas */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-xl">
            <BoxIconLine className="text-yellow-600" />
          </div>

          <div className="mt-4 sm:mt-5">
            <span className="text-xs sm:text-sm text-gray-500">
              Total Kelas
            </span>
            <h4 className="mt-1 sm:mt-2 font-bold text-gray-800 text-lg sm:text-title-sm">
              {stats.total_study_classes}
            </h4>
            <p className="mt-1 text-xs text-gray-400">
              Kelas aktif: {stats.total_study_classes}
            </p>
          </div>
        </div>

        {/* Total User */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-xl">
            <GroupIcon className="text-gray-600 size-5 sm:size-6" />
          </div>

          <div className="mt-4 sm:mt-5">
            <span className="text-xs sm:text-sm text-gray-500">
              Total User
            </span>
            <h4 className="mt-1 sm:mt-2 font-bold text-gray-800 text-lg sm:text-title-sm">
              {stats.total_users}
            </h4>
            <p className="mt-1 text-xs text-gray-400">
              Notifikasi: {stats.unread_notifications}
            </p>
          </div>
        </div>

        {/* SPP Bulan Ini */}
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 md:p-6">
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl">
            <span className="text-green-600 font-bold text-base sm:text-lg">
              S
            </span>
          </div>

          <div className="mt-4 sm:mt-5">
            <span className="text-xs sm:text-sm text-green-600">
              SPP Bulan Ini
            </span>
            <h4 className="mt-1 sm:mt-2 font-bold text-green-700 text-base sm:text-title-sm break-all">
              {formatRupiah(stats.tuition_this_month ?? 0)}
            </h4>
          </div>
        </div>

        {/* Saldo Pembangunan Bulan Ini */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 md:p-6">
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl">
            <span className="text-blue-600 font-bold text-base sm:text-lg">
              P
            </span>
          </div>

          <div className="mt-4 sm:mt-5">
            <span className="text-xs sm:text-sm text-blue-600">
              Saldo Pembangunan Bulan Ini
            </span>
            <h4 className="mt-1 sm:mt-2 font-bold text-blue-700 text-base sm:text-title-sm break-all">
              {formatRupiah(stats.development_fund_this_month ?? 0)}
            </h4>
          </div>
        </div>

        {/* Saldo Bulan Ini */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 md:p-6">
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-xl">
            <span className="text-emerald-600 font-bold text-base sm:text-lg">
              ↑
            </span>
          </div>

          <div className="mt-4 sm:mt-5">
            <span className="text-xs sm:text-sm text-emerald-600">
              Saldo Bulan Ini
            </span>
            <h4 className="mt-1 sm:mt-2 font-bold text-emerald-700 text-base sm:text-title-sm break-all">
              {formatRupiah(stats.income_this_month ?? 0)}
            </h4>
          </div>
        </div>

        {/* Total Semua Pemasukan */}
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 md:p-6">
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-xl">
            <span className="text-indigo-600 font-bold text-base sm:text-lg">
              ≈
            </span>
          </div>

          <div className="mt-4 sm:mt-5">
            <span className="text-xs sm:text-sm text-indigo-600">
              Total Duit Yang Ada
            </span>
            <h4 className="mt-1 sm:mt-2 font-bold text-indigo-700 text-base sm:text-title-sm break-all">
              {formatRupiah(stats.total_income ?? 0)}
            </h4>
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2">

        {/* Santri Perlu Diaktifkan */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h5 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white">
              Santri Perlu Diaktifkan
            </h5>
            <button
              onClick={() => router.push("/santri")}
              className="text-xs text-blue-500 hover:underline whitespace-nowrap ml-2"
            >
              Lihat semua
            </button>
          </div>

          {(stats.pending_students_list ?? []).length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              Tidak ada santri pending
            </p>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full text-sm min-w-[400px]">
                <thead>
                  <tr className="text-left text-gray-400 border-b dark:border-gray-700">
                    <th className="pb-2 font-medium pl-4 sm:pl-0">Nama</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Tgl Masuk</th>
                    <th className="pb-2 font-medium pr-4 sm:pr-0"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {(stats.pending_students_list ?? []).map((s) => (
                    <tr
                      key={s.id}
                      className={
                        s.activation_status === "due"
                          ? "bg-orange-50"
                          : s.activation_status === "soon"
                            ? "bg-yellow-50"
                            : ""
                      }
                    >
                      <td className="py-2 text-gray-700 dark:text-gray-300 pl-4 sm:pl-0 font-medium">
                        {s.name}
                      </td>
                      <td className="py-2">
                        {s.activation_status === "due" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                            Segera aktifkan
                          </span>
                        )}
                        {s.activation_status === "soon" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                            {s.days_left} hari lagi
                          </span>
                        )}
                        {s.activation_status === "waiting" && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                            Menunggu
                          </span>
                        )}
                      </td>
                      <td className="py-2 text-gray-500 text-xs">
                        {formatTanggal(s.join_date)}
                      </td>
                      <td className="py-2 pr-4 sm:pr-0">
                        {(s.activation_status === "due") && (
                          <button
                            onClick={() => setActivateTarget(s)}
                            className="px-3 py-1 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Aktifkan
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Konfirmasi Aktivasi */}
        {activateTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
              <h3 className="text-base font-semibold text-gray-800 mb-2">
                Konfirmasi Aktivasi Santri
              </h3>
              <p className="text-sm text-gray-600 mb-1">
                Apakah kamu yakin ingin mengaktifkan santri:
              </p>
              <p className="text-sm font-semibold text-gray-800 mb-4">
                {activateTarget.name}
              </p>
              <p className="text-xs text-gray-400 mb-6">
                Tgl masuk: {formatTanggal(activateTarget.join_date)}
              </p>

              {activateError && (
                <p className="text-xs text-red-500 mb-4">{activateError}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setActivateTarget(null);
                    setActivateError(null);
                  }}
                  className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                  disabled={activating}
                >
                  Batal
                </button>
                <button
                  onClick={handleActivate}
                  disabled={activating}
                  className="flex-1 px-4 py-2 text-sm bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {activating ? "Mengaktifkan..." : "Ya, Aktifkan"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Transaksi Terakhir */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h5 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white">
              Transaksi Terakhir
            </h5>

            <div className="flex gap-2">
              <button
                onClick={() => router.push("/keuangan-spp")}
                className="text-xs text-blue-500 hover:underline whitespace-nowrap"
              >
                SPP
              </button>

              <button
                onClick={() => router.push("/keuangan-pembangunan")}
                className="text-xs text-blue-500 hover:underline whitespace-nowrap"
              >
                Pembangunan
              </button>
            </div>
          </div>

          {(stats.latest_transactions ?? []).length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              Belum ada transaksi
            </p>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full text-sm min-w-[420px]">
                <thead>
                  <tr className="text-left text-gray-400 border-b dark:border-gray-700">
                    <th className="pb-2 font-medium pl-4 sm:pl-0">
                      Keterangan
                    </th>
                    <th className="pb-2 font-medium">Tipe</th>
                    <th className="pb-2 font-medium text-right pr-4 sm:pr-0">
                      Nominal
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {(stats.latest_transactions ?? []).map((t) => (
                    <tr key={`${t.type}-${t.id}`}>
                      <td className="py-2 text-gray-700 dark:text-gray-300 pl-4 sm:pl-0 max-w-[160px] sm:max-w-none truncate">
                        {t.type === "tuition"
                          ? `SPP ${t.student?.name || "-"}`
                          : t.financial_category?.name || "Pembangunan"}

                        {t.note ? (
                          <span className="block text-xs text-gray-400 truncate">
                            {t.note}
                          </span>
                        ) : null}
                      </td>

                      <td className="py-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.type === "tuition" || t.transaction_type !== "expense"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}
                        >
                          {t.type === "tuition"
                            ? "SPP"
                            : t.transaction_type === "expense"
                              ? "Pengeluaran"
                              : "Pemasukan"}
                        </span>
                      </td>

                      <td
                        className={`py-2 text-right font-medium pr-4 sm:pr-0 whitespace-nowrap ${t.transaction_type === "expense"
                          ? "text-red-600"
                          : "text-gray-700 dark:text-gray-300"
                          }`}
                      >
                        {t.transaction_type === "expense" ? "- " : ""}
                        {formatRupiah(t.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <h5 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white mb-3 sm:mb-4">
          Grafik Keuangan 4 Bulan Terakhir
        </h5>

        <div className="h-48 sm:h-64 md:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={financeChartData}
              barGap={4}
              margin={{ top: 0, right: 4, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

              <XAxis dataKey="month_label" tick={{ fontSize: 10 }} tickLine={false} />

              <YAxis
                tick={{ fontSize: 10 }}
                width={52}
                tickFormatter={(v) =>
                  new Intl.NumberFormat("id-ID", {
                    notation: "compact",
                    compactDisplay: "short",
                  }).format(Number(v || 0))
                }
              />

              <Tooltip
                content={<FinanceChartTooltip />}
                cursor={false}
              />

              <Legend wrapperStyle={{ fontSize: "12px" }} />

              <Bar
                dataKey="tuition"
                name="SPP"
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
              />

              <Bar
                dataKey="development_fund"
                name="Pembangunan"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </div>
  );
}
