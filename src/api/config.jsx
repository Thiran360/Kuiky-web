export const API_BASE_URL = "https://snappier-reapply-kieth.ngrok-free.dev";
export const ECOM_API_PATH = "/ecomapp";
export const COMMON_HEADERS = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
};
// ===========================
// 🖼 IMAGE URL HELPER
// ===========================
export const getImageUrl = (path) => {
    if (!path) return "https://via.placeholder.com/150?text=No+Image";
    if (path.startsWith("http")) return path;
    return `${API_BASE_URL}${path}`;
};
// services/config.js