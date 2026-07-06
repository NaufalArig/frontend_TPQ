const ONLINE_API_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://api.sistemtpq.web.id/api";

const LOCAL_API_URL =
    process.env.NEXT_PUBLIC_LOCAL_API_URL || "http://127.0.0.1:8000/api";

const isLocalBrowser =
    typeof window !== "undefined" &&
    ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);

const API_URL = isLocalBrowser ? LOCAL_API_URL : ONLINE_API_URL;

export default API_URL;
