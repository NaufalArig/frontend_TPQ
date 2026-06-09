import { Santri } from "./santri";
import { User } from "./user";

export type KeuanganSpp = {
    id: number;
    student_id?: number | null;
    user_id?: number | null;

    payment_date: string;
    month: number | string;
    year: number | string;
    amount: number | string;
    note?: string | null;

    student?: Santri | null;
    user?: User | null;

    created_at?: string;
    updated_at?: string;
};

export type KeuanganSppFormData = {
    student_id?: string | number | "";
    payment_date: string;
    month: string | number;
    year: string | number;
    amount: string | number;
    note?: string;
};