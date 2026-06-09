import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import RoleGuard from "@/components/RoleGuard";
import AssetForm from "../components/AssetForm";

export default function CreateAsetPage() {
    return (
        <RoleGuard allow={["admin"]}>
            <div>
                <PageBreadcrumb pageTitle="Tambah Aset" />

                <ComponentCard title="Form Tambah Aset">
                    <AssetForm />
                </ComponentCard>
            </div>
        </RoleGuard>
    );
}
