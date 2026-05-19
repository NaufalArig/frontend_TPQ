export type User = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "guru" | "bendahara";
};

export type UserFormData = {
  name: string;
  email: string;
  password?: string;
  role: "admin" | "guru" | "bendahara" | "";
};