import axios from "axios";
import Cookies from "js-cookie";
import API_URL from "@/lib/api";

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        Accept: "application/json",
    },
});

axiosInstance.interceptors.request.use((config) => {
    const token = Cookies.get("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default axiosInstance;
