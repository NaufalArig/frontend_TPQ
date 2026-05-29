"use client";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import KeuanganTable from "./components/KeuanganTable";
import Link from "next/link";
import RoleGuard from "@/components/RoleGuard";
import { useState } from "react";
import { downloadLaporanKeuangan } from "@/services/keuangan";

export default function KeuanganPage() {
  const [search, setSearch] = useState("");
  const [jenisFilter, setJenisFilter] = useState("");

  return (
    <RoleGuard allow={["admin", "bendahara"]}>
      <div>
        <PageBreadcrumb pageTitle="Menu Keuangan" />
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <Link
              href="/keuangan/create"
              className="bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-500"
            >Tambah Keuangan
            </Link>
            <button
              onClick={downloadLaporanKeuangan}
              className="rounded-lg border border-brand-700 bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
            >
              Download Laporan
            </button>
          </div>
          <ComponentCard
            title="Daftar Tabel Keuangan"
            action={
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <span className="absolute -translate-y-1/2 left-4 top-1/2 pointer-events-none">
                    <svg
                      className="fill-gray-600 "
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                        fill=""
                      />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari transaksi..."
                    className="w-full rounded-lg border border-brand-300 hover:bg-brand-100 bg-transparent px-4 py-2.5 pl-12 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-500 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 sm:w-44"
                  />
                </div>

                <select
                  value={jenisFilter}
                  onChange={(e) => setJenisFilter(e.target.value)}
                  className="w-full rounded-lg border border-brand-300 hover:bg-brand-100 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-500 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 sm:w-44"
                >
                  <option value="">Semua Jenis</option>
                  <option value="pemasukan">Pemasukan</option>
                  <option value="pengeluaran">Pengeluaran</option>
                </select>
              </div>
            }
          >
            <KeuanganTable
              search={search}
              jenisFilter={jenisFilter}
            />
          </ComponentCard>
        </div>
      </div>
    </RoleGuard>
  );
}
