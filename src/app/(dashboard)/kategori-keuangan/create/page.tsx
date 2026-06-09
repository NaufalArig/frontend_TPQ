import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import RoleGuard from "@/components/RoleGuard";
import KategoriKeuanganForm from "../components/KategoriKeuanganForm";

export default function CreateKategoriKeuanganPage() {
    return (
        <RoleGuard allow={["admin"]}>
            <div>
                <PageBreadcrumb pageTitle="Tambah Kategori Keuangan" />

                <ComponentCard title="Form Tambah Kategori Keuangan">
                    <KategoriKeuanganForm />
                </ComponentCard>
            </div>
        </RoleGuard>
    );
}