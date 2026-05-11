"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getKeuangan, deleteKeuangan } from "@/services/keuangan";
import { Keuangan, KeuanganSummary } from "@/types/keuangan";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

export default function KeuanganPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<KeuanganSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const data = await getKeuangan();
    setSummary(data);
    setLoading(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await getKeuangan();
      setSummary(data);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus transaksi ini?")) return;
    await deleteKeuangan(id);
    loadData();
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <PageBreadcrumb pageTitle="Keuangan" />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm text-green-600 font-medium">Total Pemasukan</p>
          <p className="text-xl font-bold text-green-700">
            {formatRupiah(summary?.pemasukan || 0)}
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-600 font-medium">Total Pengeluaran</p>
          <p className="text-xl font-bold text-red-700">
            {formatRupiah(summary?.pengeluaran || 0)}
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-600 font-medium">Saldo</p>
          <p className="text-xl font-bold text-blue-700">
            {formatRupiah(summary?.saldo || 0)}
          </p>
        </div>
      </div>

      <ComponentCard title="Daftar Transaksi">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => router.push("/keuangan/create")}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm"
          >
            + Tambah Transaksi
          </button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableCell isHeader>Tanggal</TableCell>
              <TableCell isHeader>Jenis</TableCell>
              <TableCell isHeader>Keterangan</TableCell>
              <TableCell isHeader>Nominal</TableCell>
              <TableCell isHeader>Dibuat Oleh</TableCell>
              <TableCell isHeader>Aksi</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summary?.data.map((item: Keuangan) => (
              <TableRow key={item.id}>
                <TableCell>{item.tanggal}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.jenis === "pemasukan"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                    }`}>
                    {item.jenis}
                  </span>
                </TableCell>
                <TableCell>{item.keterangan}</TableCell>
                <TableCell>{formatRupiah(item.nominal)}</TableCell>
                <TableCell>{item.user?.name || "-"}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/keuangan/edit/${item.id}`)}
                      className="text-blue-500 hover:underline text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-500 hover:underline text-sm"
                    >
                      Hapus
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ComponentCard>
    </div>
  );
}