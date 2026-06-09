export type TeacherStatus = "pending" | "active" | "inactive";

export type TeacherGender = "male" | "female" | "";

export type GuruUser = {
    id: number;
    name: string;
    username: string;
    email: string | null;
    role: "admin" | "teacher" | "treasurer";
    status: "active" | "inactive";
};

export type GuruFormData = {
    // akun login guru, dipakai saat create
    username?: string;
    email?: string | null;
    password?: string;

    // data guru
    teacher_number?: string;
    tpq_number?: string;

    name: string;
    gender?: TeacherGender;

    birth_place?: string;
    birth_date?: string;

    address?: string;
    village?: string;
    district?: string;
    city?: string;
    province?: string;

    phone?: string;

    certificate_from?: string;
    certificate_number?: string;
    education?: string;

    join_date: string;
    leave_date?: string;

    status?: TeacherStatus;

    photo?: File | string | null;
};

export type Guru = {
    id: number;
    user_id?: number | null;

    teacher_number?: string | null;
    tpq_number?: string | null;

    name: string;
    gender?: "male" | "female" | null;

    birth_place?: string | null;
    birth_date?: string | null;

    address?: string | null;
    village?: string | null;
    district?: string | null;
    city?: string | null;
    province?: string | null;

    phone?: string | null;

    certificate_from?: string | null;
    certificate_number?: string | null;
    education?: string | null;

    join_date: string;
    leave_date?: string | null;

    status: TeacherStatus;

    photo?: string | null;
    age_notification_sent?: boolean;

    user?: GuruUser | null;

    created_at?: string;
    updated_at?: string;
};