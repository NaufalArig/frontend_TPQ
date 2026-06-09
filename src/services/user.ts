import API_URL from "@/lib/api";
import { PasswordFormData, ProfileFormData, UserFormData } from "@/types/user";
import Cookies from "js-cookie";
import api from "@/lib/axios";

function getToken() {
  if (typeof document === "undefined") return null;

  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];
}

export async function getUserById(id: string | number) {
  const token = getToken();

  const res = await fetch(`${API_URL}/users/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil data user");
  }

  return res.json();
}

export async function getUser() {
  const token = Cookies.get("token");

  if (!token) {
    throw new Error("Token tidak ada");
  }

  const res = await fetch(`${API_URL}/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Gagal ambil user");
  }

  return res.json();
}

export async function getUsers() {
  const res = await api.get("/users");
  return res.data;
}

export async function createUser(data: UserFormData) {
  const payload = {
    name: data.name,
    username: data.username,
    email: data.email?.trim() ? data.email : null,
    password: data.password,
    role: data.role,
    status: data.status || "aktif",
  };

  const res = await api.post("/users", payload);
  return res.data;
}

export async function updateUser(id: number, data: UserFormData) {
  const payload: Partial<UserFormData> = {
    name: data.name,
    username: data.username,
    email: data.email?.trim() ? data.email : null,
    role: data.role,
    status: data.status,
  };

  if (data.password && data.password.trim() !== "") {
    payload.password = data.password;
  }

  const res = await api.put(`/users/${id}`, payload);
  return res.data;
}

export async function deleteUser(id: number) {
  const res = await api.delete(`/users/${id}`);
  return res.data;
}

export async function updateProfile(data: ProfileFormData) {
  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("username", data.username);

  if (data.email?.trim()) {
    formData.append("email", data.email);
  }

  if (data.photo instanceof File) {
    formData.append("photo", data.photo);
  }

  formData.append("_method", "PUT");

  const res = await api.post("/profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
}

export async function updateProfilePassword(data: PasswordFormData) {
  const res = await api.put("/profile/password", data);
  return res.data;
}
