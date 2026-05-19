"use client";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import KeuanganTable from "./components/KeuanganTable";
import Link from "next/link";

export default function KeuanganPage() {

  return (
    <div>
      <PageBreadcrumb pageTitle="Menu Keuangan" />
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/keuangan/create"
            className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-500"
          >Tambah Keuangan
          </Link>
        </div>
        <ComponentCard title="Daftar Tabel Keuangan">
          <KeuanganTable />
        </ComponentCard>
      </div>
    </div>
  );
}
