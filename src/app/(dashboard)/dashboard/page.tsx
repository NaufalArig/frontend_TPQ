"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDashboardStats } from "@/services/dashboard";
import { DashboardStats } from "@/types/dashboard";
import { BoxIconLine, GroupIcon } from "@/icons";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const data = await getDashboardStats();
      setStats(data);
    };
    fetchData();
  }, []);

  if (!stats) return <div className="p-6">Loading...</div>;
  console.log(stats.chart_keuangan);

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 md:gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl">
            <GroupIcon className="text-blue-600 size-6" />
          </div>
          <div className="mt-5">
            <span className="text-sm text-gray-500">Total Santri</span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm">{stats.total_santri}</h4>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl">
            <BoxIconLine className="text-purple-600" />
          </div>
          <div className="mt-5">
            <span className="text-sm text-gray-500">Total Guru</span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm">{stats.total_guru}</h4>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl">
            <BoxIconLine className="text-gray-600" />
          </div>
          <div className="mt-5">
            <span className="text-sm text-gray-500">Total User</span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm">{stats.total_user}</h4>
          </div>
        </div>

        <div className="rounded-2xl border border-green-200 bg-green-50 p-5 md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl">
            <span className="text-green-600 font-bold text-lg">↑</span>
          </div>
          <div className="mt-5">
            <span className="text-sm text-green-600">Pemasukan Bulan Ini</span>
            <h4 className="mt-2 font-bold text-green-700 text-title-sm">
              {formatRupiah(stats.pemasukan ?? 0)}
            </h4>
          </div>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl">
            <span className="text-red-600 font-bold text-lg">↓</span>
          </div>
          <div className="mt-5">
            <span className="text-sm text-red-600">Pengeluaran Bulan Ini</span>
            <h4 className="mt-2 font-bold text-red-700 text-title-sm">
              {formatRupiah(stats.pengeluaran ?? 0)}
            </h4>
          </div>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl">
            <span className="text-blue-600 font-bold text-lg">≈</span>
          </div>
          <div className="mt-5">
            <span className="text-sm text-blue-600">Saldo</span>
            <h4 className="mt-2 font-bold text-blue-700 text-title-sm">
              {formatRupiah(stats.saldo ?? 0)}
            </h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between mb-4">
            <h5 className="font-semibold text-gray-800 dark:text-white">Santri Perlu Diaktifkan</h5>
            <button onClick={() => router.push("/santri")} className="text-xs text-blue-500 hover:underline">
              Lihat semua
            </button>
          </div>
          {(stats.santri_pending ?? []).length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Tidak ada santri pending</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b dark:border-gray-700">
                  <th className="pb-2 font-medium">Nama</th>
                  <th className="pb-2 font-medium">Tgl Masuk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {(stats.santri_pending ?? []).map((s) => (
                  <tr key={s.id}>
                    <td className="py-2 text-gray-700 dark:text-gray-300">{s.nama}</td>
                    <td className="py-2 text-gray-500">
                      {new Date(s.tanggal_masuk).toLocaleDateString("id-ID", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between mb-4">
            <h5 className="font-semibold text-gray-800 dark:text-white">Transaksi Terakhir</h5>
            <button onClick={() => router.push("/keuangan")} className="text-xs text-blue-500 hover:underline">
              Lihat semua
            </button>
          </div>
          {(stats.transaksi_terakhir ?? []).length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Belum ada transaksi</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b dark:border-gray-700">
                  <th className="pb-2 font-medium">Keterangan</th>
                  <th className="pb-2 font-medium">Jenis</th>
                  <th className="pb-2 font-medium text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {(stats.transaksi_terakhir ?? []).map((t) => (
                  <tr key={t.id}>
                    <td className="py-2 text-gray-700 dark:text-gray-300">{t.keterangan}</td>
                    <td className="py-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.jenis === "pemasukan"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}>
                        {t.jenis}
                      </span>
                    </td>
                    <td className="py-2 text-right font-medium text-gray-700 dark:text-gray-300">
                      {formatRupiah(t.nominal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <h5 className="font-semibold text-gray-800 dark:text-white mb-4">
          Grafik Keuangan 6 Bulan Terakhir
        </h5>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.chart_keuangan ?? []} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="bulan" tick={{ fontSize: 12 }} />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(v) =>
                new Intl.NumberFormat("id-ID", {
                  notation: "compact",
                  compactDisplay: "short",
                }).format(v)
              }
            />
            <Tooltip
              formatter={(value: unknown) => {
                const amount = Number(value ?? 0);
                return formatRupiah(amount);
              }}
            />
            <Legend />
            <Bar dataKey="pemasukan" name="Pemasukan" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="pengeluaran" name="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}