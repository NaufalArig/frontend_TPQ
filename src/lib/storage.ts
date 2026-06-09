import API_URL from "@/lib/api";

export const DEFAULT_USER_PHOTO = "/images/user/default-user.png";

const STORAGE_URL = API_URL.replace(/\/api\/?$/, "/storage");

export function getStorageUrl(path?: string | null, fallback = DEFAULT_USER_PHOTO) {
    if (!path) return fallback;

    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }

    return `${STORAGE_URL}/${path}`;
}
