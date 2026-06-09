export type AssetCategoryStatus = "active" | "inactive";

export type AssetStatus =
    | "available"
    | "in_use"
    | "maintenance"
    | "disposed";

export type AssetCondition =
    | "good"
    | "minor_damage"
    | "damaged"
    | "lost";

export type AssetCategory = {
    id: number;
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

export type Asset = {
    id: number;

    asset_category_id?: number | null;
    category?: AssetCategory | null;

    asset_code?: string | null;
    name: string;
    brand?: string | null;

    quantity: number;
    unit?: string | null;

    acquisition_date?: string | null;
    source?: string | null;
    location?: string | null;

    condition: AssetCondition;
    status: AssetStatus;

    estimated_value?: number | string | null;
    photo?: string | null;
    note?: string | null;

    created_at?: string;
    updated_at?: string;
};

export type AssetFormData = {
    asset_category_id?: string | number | "";
    asset_code?: string;
    name: string;
    brand?: string;
    quantity: string | number;
    unit?: string;
    acquisition_date?: string;
    source?: string;
    location?: string;
    condition: AssetCondition | "";
    status: AssetStatus | "";
    estimated_value?: string | number;
    photo?: File | string | null;
    note?: string;
};