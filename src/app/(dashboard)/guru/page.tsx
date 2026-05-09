import RoleGuard from "@/components/RoleGuard";

export default function GuruPage() {
  return (
    <RoleGuard allow={["admin"]}>
      <div>
        <h1 className="text-xl font-bold">Data Guru</h1>
      </div>
    </RoleGuard>
  );
}