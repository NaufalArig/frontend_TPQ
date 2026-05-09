import API_URL from "@/lib/api";
import Cookies from "js-cookie";

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