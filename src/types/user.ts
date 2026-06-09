export type UserRole = "admin" | "teacher" | "treasurer";
export type UserStatus = "active" | "inactive";

export type User = {
  id: number;
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

export type UserFormData = {
  name: string;
  username: string;
  email?: string | null;
  password?: string;
  role: UserRole | "";
  status: UserStatus | "";
};
