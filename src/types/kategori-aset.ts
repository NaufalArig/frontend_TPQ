export type AssetCategoryStatus = "active" | "inactive";

export type AssetCategory = {
    id: number;
    tpq_id?: number;
    name: string;
    description?: string | null;
    status: AssetCategoryStatus;
    assets_count?: number;
    created_at?: string;
    updated_at?: string;
};

export type AssetCategoryFormData = {
    name: string;
    description?: string;
    status: AssetCategoryStatus | "";
};