import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import RoleGuard from "@/components/RoleGuard";
import KeuanganPembangunanForm from "../components/KeuanganPembangunanForm";

export default function CreateKeuanganPembangunanPage() {
    return (
        <RoleGuard allow={["admin", "treasurer"]}>
            <div>
                <PageBreadcrumb pageTitle="Tambah Keuangan Pembangunan" />

                <ComponentCard title="Form Tambah Keuangan Pembangunan">
                    <KeuanganPembangunanForm />
                </ComponentCard>
            </div>
        </RoleGuard>
    );
}