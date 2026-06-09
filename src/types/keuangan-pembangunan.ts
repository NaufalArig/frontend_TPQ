import { KategoriKeuangan } from "./kategori-keuangan";
import { User } from "./user";

export type KeuanganPembangunan = {
    id: number;
    financial_category_id: number;
    user_id?: number | null;

    payment_date: string;
    transaction_type: "income" | "expense";
    amount: number | string;
    note?: string | null;

    financialCategory?: KategoriKeuangan | null;
    financial_category?: KategoriKeuangan | null;

    user?: User | null;

    created_at?: string;
    updated_at?: string;
};

export type KeuanganPembangunanFormData = {
    financial_category_id: string | number | "";
    payment_date: string;
    transaction_type: "income" | "expense" | "";
    amount: string | number;
    note?: string;
};
