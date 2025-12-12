// services/config.js

// ===========================
// 🌐 CORRECT CONFIGURATION
// ===========================
export const API_BASE_URL = "https://snappier-reapply-kieth.ngrok-free.dev";
// ❗ No /ec — this was your bug

// Base path for the ecom endpoints
export const ECOM_API_PATH = "/ecomapp";
// ❗ Must start with /

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
