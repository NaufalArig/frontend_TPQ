import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import KelasForm from "../components/KelasForm";
import RoleGuard from "@/components/RoleGuard";

export default function CreateKelasPage() {
    return (
        <RoleGuard allow={["admin"]}>
            <div>
                <PageBreadcrumb pageTitle="Tambah Kelas" />

                <ComponentCard title="Form Tambah Kelas">
                    <KelasForm />
                </ComponentCard>
            </div>
        </RoleGuard>
    );
}