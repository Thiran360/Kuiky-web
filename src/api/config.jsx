// services/config.js
// ===========================
// 🌐 API CONFIGURATION
// ===========================

// ✅ Base URL ONLY (no /ecomapp here)
export const API_BASE_URL = "https://api.codingboss.in";

// ✅ E-commerce API base path
export const ECOM_API_PATH = "/ecomapp/";

// ✅ Common headers for all requests
export const COMMON_HEADERS = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
};

// ===========================
// 🖼 IMAGE URL HELPER (FIXED)
// ===========================
export const getImageUrl = (path) => {
    // 1️⃣ No image from API or empty data
    if (!path || path === "" || path === "null" || path === "undefined") {
        return "/images/no-image.png";
    }

    let finalPath = path;

    // 2️⃣ Handle Absolute URLs from Backend (Fixing Localhost & Mixed Content)
    if (finalPath.startsWith("http://") || finalPath.startsWith("https://")) {
        // Force HTTPS to avoid Mixed Content blocker in modern browsers
        if (finalPath.startsWith("http://")) {
            finalPath = finalPath.replace("http://", "https://");
        }

        // If the backend returns a localhost/127.0.0.1 URL, redirect to production API base
        if (finalPath.includes("localhost") || finalPath.includes("127.0.0.1")) {
            const pathParts = finalPath.split("/");
            // Find where 'media' or the first real path segment starts
            const mediaIndex = pathParts.findIndex(p => p === "media" || p === "static");
            const startIdx = mediaIndex !== -1 ? mediaIndex : 3;
            const relativePath = pathParts.slice(startIdx).join("/");
            finalPath = relativePath;
        } else {
            return finalPath; // Already correct external URL
        }
    }

    // 3️⃣ Construct Production URL from relative path
    // Clean potential double slashes if path starts with /
    const cleanPath = finalPath.startsWith("/") ? finalPath.substring(1) : finalPath;
    const baseUrl = API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL;

    // Check if the path already contains 'media' or needs to be routed through ecomapp
    // Most shop APIs host media as API_BASE/media/ or API_BASE/ecomapp/media/
    return `${baseUrl}/${cleanPath}`;
};
