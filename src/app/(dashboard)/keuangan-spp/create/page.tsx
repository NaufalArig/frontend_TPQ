import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import RoleGuard from "@/components/RoleGuard";
import KeuanganSppForm from "../components/KeuanganSppForm";

export default function CreateKeuanganSppPage() {
    return (
        <RoleGuard allow={["admin", "treasurer"]}>
            <div>
                <PageBreadcrumb pageTitle="Tambah Keuangan SPP" />

                <ComponentCard title="Form Tambah Keuangan SPP">
                    <KeuanganSppForm />
                </ComponentCard>
            </div>
        </RoleGuard>
    );
}