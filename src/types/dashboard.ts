export type PendingStudent = {
    id: number;
    study_class_id?: number | null;

    name: string;
    birth_date: string;
    join_date?: string | null;

    status?: "pending" | "active" | "graduated" | "left";

    study_class?: {
        id: number;
        name: string;
    } | null;

    studyClass?: {
        id: number;
        name: string;
    } | null;
};

export type LatestTransaction = {
    id: number;

    type: "tuition" | "development_fund";
    transaction_type?: "income" | "expense";

    payment_date: string;
    amount: number;
    note?: string | null;

    user?: {
        id: number;
        name: string;
        username?: string;
    } | null;

    student?: {
        id: number;
        name: string;
        nisn?: string | null;
    } | null;

    financial_category?: {
        id: number;
        name: string;
    } | null;

    financialCategory?: {
        id: number;
        name: string;
    } | null;

    created_at?: string;
};

export type FinanceChart = {
    month_label: string;
    tuition: number;
    development_fund: number;
    total_income: number;
};

export type DashboardStats = {
    total_students: number;
    active_students: number;
    pending_students: number;
    graduated_students: number;
    left_students: number;

    total_teachers: number;
    active_teachers: number;
    pending_teachers: number;
    inactive_teachers: number;

    total_users: number;

    total_study_classes: number;
    active_study_classes: number;

    tuition_this_month: number;
    development_fund_this_month: number;
    income_this_month: number;

    total_tuition: number;
    total_development_fund: number;
    total_income: number;

    unread_notifications: number;

    pending_students_list: PendingStudent[];
    latest_transactions: LatestTransaction[];
    finance_chart: FinanceChart[];
};
