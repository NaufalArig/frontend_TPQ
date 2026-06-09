export type Gender = "male" | "female" | "";

export type StudentType = "regular" | "pre_qiraati" | "qiraati" | "";

export type StudentStatus = "pending" | "active" | "graduated" | "left";

export type StudyClassStatus = "active" | "inactive";

export type StudyClass = {
    id: number;
    name: string;
    description?: string | null;
    status: StudyClassStatus;
};

export type SantriFormData = {
    study_class_id?: string | number | "";

    student_number?: string;
    tpq_number?: string;

    name: string;

    nisn?: string;
    nik?: string;
    family_card_number?: string;

    gender: Gender;

    birth_place?: string;
    birth_date: string;

    child_order?: string | number;
    siblings_count?: string | number;

    father_name?: string;
    mother_name?: string;
    contact_guardian?: string;

    hamlet?: string;
    village?: string;
    district?: string;
    city?: string;
    province?: string;

    formal_school?: string;
    formal_class?: string;
    npsn?: string;

    student_type: StudentType;

    status?: StudentStatus;

    photo?: File | string | null;
    family_card_file?: File | string | null;
    birth_certificate_file?: File | string | null;
};

export type Santri = {
    id: number;

    study_class_id?: number | null;
    study_class?: StudyClass | null;

    student_number?: string | null;
    tpq_number?: string | null;

    name: string;

    nisn?: string | null;
    nik?: string | null;
    family_card_number?: string | null;

    gender: "male" | "female";

    birth_place?: string | null;
    birth_date: string;

    child_order?: number | null;
    siblings_count?: number | null;

    father_name?: string | null;
    mother_name?: string | null;
    contact_guardian?: string | null;

    hamlet?: string | null;
    village?: string | null;
    district?: string | null;
    city?: string | null;
    province?: string | null;

    formal_school?: string | null;
    formal_class?: string | null;
    npsn?: string | null;

    join_date?: string | null;

    student_type: "regular" | "pre_qiraati" | "qiraati";

    status: StudentStatus;

    photo?: string | null;
    family_card_file?: string | null;
    birth_certificate_file?: string | null;

    age_notification_sent?: boolean;

    created_at?: string;
    updated_at?: string;
};