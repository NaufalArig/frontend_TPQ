"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getDashboardStats } from "@/services/dashboard";
import { DashboardStats } from "@/types/dashboard";
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

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const router = useRouter();

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
        {/* Santri Pending */}
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
              <table className="w-full text-sm min-w-[360px]">
                <thead>
                  <tr className="text-left text-gray-400 border-b dark:border-gray-700">
                    <th className="pb-2 font-medium pl-4 sm:pl-0">Nama</th>
                    <th className="pb-2 font-medium">Kelas</th>
                    <th className="pb-2 font-medium pr-4 sm:pr-0">
                      Tgl Masuk
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {(stats.pending_students_list ?? []).map((s) => (
                    <tr key={s.id}>
                      <td className="py-2 text-gray-700 dark:text-gray-300 pl-4 sm:pl-0">
                        {s.name}
                      </td>

                      <td className="py-2 text-gray-500">
                        {s.study_class?.name || "-"}
                      </td>

                      <td className="py-2 text-gray-500 pr-4 sm:pr-0">
                        {formatTanggal(s.join_date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

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
                        className={`py-2 text-right font-medium pr-4 sm:pr-0 whitespace-nowrap ${
                          t.transaction_type === "expense"
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
                formatter={(value: unknown) => {
                  const amount = Number(value ?? 0);
                  return formatRupiah(amount);
                }}
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
    </div>
  );
}
