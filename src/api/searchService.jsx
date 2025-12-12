// Example: src/services/api/searchService.js

// Import constants from your configuration file
import { API_BASE_URL, ECOM_API_PATH, COMMON_HEADERS } from "../config"; 

// --- SEARCH API FUNCTION ---
export const fetchProductsBySearch = async (query, lat, lon) => {
    // Construct the full search endpoint using the defined constants
    const searchPath = `/products/search?query=${encodeURIComponent(query)}&lat=${lat}&lon=${lon}`;
    
    const url = `${API_BASE_URL}${ECOM_API_PATH}${searchPath}`;
    
    console.log("Fetching search results from external API:", url);

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: COMMON_HEADERS, // Includes ngrok-skip-browser-warning header
        }); 

        if (!response.ok) {
            // Handle HTTP errors (e.g., 404, 500)
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data; // Returns the search results
        
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error; // Propagate the error to the calling component
    }
};

// --- END OF searchService.js ---