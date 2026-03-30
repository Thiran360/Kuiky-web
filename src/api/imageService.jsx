import { useState, useEffect } from "react";
import { getImageUrl } from "./config";

/**
 * 🔗 Global Singleton Cache for Blobs
 * Prevents 1,200+ redundant network requests and ensures premium UI performance.
 */
const imageCache = new Map();
const pendingRequests = new Map();

export const useSmartImage = (rawPath) => {
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

        // 🚀 Hit cache first
        if (imageCache.has(fullUrl)) {
            setSrc(imageCache.get(fullUrl));
            setLoaded(true);
            return;
        }

        const loadImage = async () => {
            // 🛑 Request Collapsing: Join existing request if pending
            if (pendingRequests.has(fullUrl)) {
                try {
                    const sharedBlobUrl = await pendingRequests.get(fullUrl);
                    setSrc(sharedBlobUrl);
                    setLoaded(true);
                } catch (err) {
                    setSrc(fullUrl);
                } finally {
                    setLoaded(true);
                }
                return;
            }

            const fetchPromise = (async () => {
                try {
                    const response = await fetch(fullUrl, {
                        headers: { 'ngrok-skip-browser-warning': 'true' }
                    });

                    if (response.ok) {
                        const contentType = response.headers.get('content-type') || '';
                        if (contentType.startsWith('image/')) {
                            const blob = await response.blob();
                            const blobUrl = URL.createObjectURL(blob);
                            imageCache.set(fullUrl, blobUrl);
                            return blobUrl;
                        }
                    }
                    throw new Error('Not an image');
                } catch (err) {
                    throw err;
                }
            })();

            pendingRequests.set(fullUrl, fetchPromise);

            try {
                const finalBlobUrl = await fetchPromise;
                setSrc(finalBlobUrl);
            } catch (err) {
                setSrc(fullUrl);
                setError(true);
            } finally {
                pendingRequests.delete(fullUrl);
                setLoaded(true);
            }
        };

        loadImage();
    }, [rawPath]);

    return { src, loaded, error };
};
