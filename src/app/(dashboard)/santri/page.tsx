"use client";

import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import SantriTable from "./components/SantriTable";
import Link from "next/link";

export default function SantriPage() {

  return (
    <div>
      <PageBreadcrumb pageTitle="Data Santri" />
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/santri/create"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >Tambah Santri
          </Link>
        </div>
        <ComponentCard title="Data Tabel 1">
          <SantriTable />
        </ComponentCard>
      </div>
    </div>
  );
}
