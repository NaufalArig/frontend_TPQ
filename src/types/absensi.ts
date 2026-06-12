export type AttendanceStatus = "present" | "permission" | "sick" | "absent";

export type AbsensiSantriItem = {
    id: number;
    name: string;
    nisn?: string | null;
    student_number?: string | null;

    study_class?: {
        id: number;
        name: string;
    } | null;

    attendance?: {
        id: number;
        student_id: number;
        user_id?: number | null;
        attendance_date: string;
        status: AttendanceStatus;
        note?: string | null;
    } | null;
};

export type AbsensiSantriResponse = {
    attendance_date: string;
    study_class_id?: string | number | null;
    students: AbsensiSantriItem[];
};

export type AbsensiSubmitData = {
    attendance_date: string;
    attendances: {
        student_id: number;
        status: AttendanceStatus;
        note?: string | null;
    }[];
};

export type RiwayatAbsensiItem = {
    id: number;
    student_id: number;
    user_id: number | null;

    attendance_date: string;
    status: AttendanceStatus;
    note: string | null;

    student?: {
        id: number;
        name: string;
        nisn?: string | null;
        study_class?: {
            id: number;
            name: string;
        } | null;
    } | null;

    user?: {
        id: number;
        name: string;
        username?: string;
    } | null;

    created_at?: string;
    updated_at?: string;
};