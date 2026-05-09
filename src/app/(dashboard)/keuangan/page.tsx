import RoleGuard from "@/components/RoleGuard";

export default function KeuanganPage() {
  return (
    <RoleGuard allow={["admin", "bendahara"]}>
      <div>
        <h1 className="text-xl font-bold">Keuangan</h1>
        <p>Data keuangan hanya untuk admin & bendahara</p>
      </div>
    </RoleGuard>
  );
}