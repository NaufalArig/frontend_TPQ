export type UserRole = "admin" | "teacher" | "treasurer";
export type UserStatus = "active" | "inactive";

export type UserTpq = {
  id: number;
  name: string;
};

export type User = {
  id: number;
  tpq_id?: number | null;
  tpq?: UserTpq | null;
  name: string;
  username: string;
  email: string | null;
  role: UserRole;
  status: UserStatus;
  photo?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type ProfileFormData = {
  name: string;
  username: string;
  email?: string | null;
  photo?: File | null;
};

export type PasswordFormData = {
  current_password: string;
  password: string;
  password_confirmation: string;
};

export type UserFormRole = "admin" | "teacher" | "treasurer";

export type UserFormData = {
  name: string;
  username: string;
  email?: string | null;
  password?: string;
  role: UserFormRole | "";
  status: UserStatus | "";
};
