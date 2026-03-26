import { useState, useEffect } from "react";
import { getImageUrl } from "./config";

/**
 * 🚀 High-Performance Image Hook
 * Bypasses ngrok splash screens using Blob fetch + headers.
 * Handles fallbacks, loading states, and prevents empty-string src warnings.
 */
export const useSmartImage = (rawPath) => {
    // Initialize with fallback to prevent React "empty string" warnings
    const [src, setSrc] = useState(getImageUrl(null));
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!rawPath) {
            setSrc(getImageUrl(null));
            setLoaded(true);
            return;
        }

        const fullUrl = getImageUrl(rawPath);
        let blobUrl = '';

        const loadImage = async () => {
            try {
                // Fetch with ngrok bypass headers
                const response = await fetch(fullUrl, {
                    headers: { 'ngrok-skip-browser-warning': 'true' }
                });

                if (response.ok) {
                    const contentType = response.headers.get('content-type') || '';
                    if (contentType.startsWith('image/')) {
                        const blob = await response.blob();
                        blobUrl = URL.createObjectURL(blob);
                        setSrc(blobUrl);
                        setLoaded(true);
                        return;
                    }
                }
                
                // Fallback to direct URL if blob fails but response was somewhat OK
                setSrc(fullUrl);
            } catch (err) {
                console.warn(`SmartImage failed for: ${fullUrl}. Using fallback.`);
                setSrc(fullUrl);
                setError(true);
            } finally {
                setLoaded(true);
            }
        };

        loadImage();

        // Cleanup blob URL to prevent memory leaks
        return () => {
            if (blobUrl) URL.revokeObjectURL(blobUrl);
        };
    }, [rawPath]);

    return { src, loaded, error };
};
