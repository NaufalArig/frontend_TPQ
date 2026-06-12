export type KelasStatus = "active" | "inactive";

export type KelasTeacher = {
    id: number;
    name: string;
};

export type Kelas = {
    id: number;
    tpq_id?: number;
    teacher_id?: number | null;
    teacher?: KelasTeacher | null;
    name: string;
    description?: string | null;
    status: KelasStatus;
    students_count?: number;
    santris_count?: number;
    santris?: {
        id: number;
        name: string;
        status: string;
        join_date?: string | null;
    }[];
    created_at?: string;
    updated_at?: string;
};

export type KelasFormData = {
    teacher_id?: string | number | "";
    name: string;
    description?: string;
    status: KelasStatus | "";
};