export type FinancialCategoryStatus = "active" | "inactive";

export type KategoriKeuangan = {
    id: number;
    name: string;
    description?: string | null;
    status: FinancialCategoryStatus;
    created_at?: string;
    updated_at?: string;
};

export type KategoriKeuanganFormData = {
    name: string;
    description?: string;
    status: FinancialCategoryStatus | "";
};