export type KelasStatus = "active" | "inactive";

export type Kelas = {
    id: number;
    name: string;
    description?: string | null;
    status: KelasStatus;
    students_count?: number;
    santris_count?: number;
    created_at?: string;
    updated_at?: string;
};

export type KelasFormData = {
    name: string;
    description?: string;
    status: KelasStatus | "";
};