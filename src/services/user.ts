import API_URL from "@/lib/api";
import { UserFormData } from "@/types/user";
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
        throw new Error("Gagal mengambil data santri");
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
  const res = await api.post("/users", data);
  return res.data;
}

export async function updateUser(id: number, data: UserFormData) {
  const res = await api.put(`/users/${id}`, data);
  return res.data;
}

export async function deleteUser(id: number) {
  const res = await api.delete(`/users/${id}`);
  return res.data;
}