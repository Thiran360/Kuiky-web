// src/api/searchService.js
import api from "./api";

// --- SEARCH API FUNCTION ---
export const fetchProductsBySearch = async (query) => {
    const lat = localStorage.getItem("latitude") || "0";
    const lon = localStorage.getItem("longitude") || "0";

    console.log("Fetching search results for:", query);

    try {
        const res = await api.get("/search-product/", {
            params: { query, lat, lon },
        });
        return res.data;
    } catch (error) {
        console.error("Error fetching search data:", error);
        throw error;
    }
};

// --- END OF searchService.js ---