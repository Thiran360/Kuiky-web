import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// import { fetchBanners } from '../../api/api'; // Removed/Commented: API is currently failing
import './CategoryRail.css';

// --- Default Banner (Moved outside for cleaner state logic) ---
const defaultBanner = {
    badge: 'Limited Time Offer',
    title: 'Organic & Fresh',
    subtitle: 'Delivered Daily',
    description: 'Shop the best quality vegetables and fruits directly from farmers.',
    promoCode: 'FRESH20',
    buttonText: 'Shop Now',
    emoji: '🥦',
    // Added an image placeholder for the default case, replace with a real local image path if available
    image: 'https://via.placeholder.com/300x300?text=Fresh+Produce' 
};

const HeroBanner = () => {
    // Initialize banners as empty array, which will guarantee the default banner is used
    const [banners, setBanners] = useState([]); 
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadBanners = async () => {
            setLoading(true);

            // --- SIMULATED API FAILURE / TEMPORARY FIX ---
            // Simulating a network delay to show the loading state
            await new Promise(resolve => setTimeout(resolve, 800)); 

            // Since the API is broken (404/500) and commented out, 
            // we intentionally set banners to an empty array.
            // console.error("API failed (404/500). Forcing display of default banner.");
            setBanners([]); 
            // --- END OF FIX ---
            
            setLoading(false);
        };

        loadBanners();
        
        // Cleanup function is not strictly needed here but good practice
        // return () => {}; 
    }, []); // Dependency array is empty, runs once on mount

    // Auto-slide functionality is now effectively disabled since banners.length is always 0 or 1
    useEffect(() => {
        if (banners.length > 1) {
            const timer = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % banners.length);
            }, 5000);

            return () => clearInterval(timer);
        }
    }, [banners.length]);

    // Navigation handlers are not strictly needed when length <= 1, but kept for completeness
    const handleDotClick = (index) => {
        setCurrentIndex(index);
    };

    const handleNextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
    };

    const handlePrevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    };

    // Crucial fallback: If banners array is empty, use defaultBanner object.
    const currentBanner = banners.length > 0 ? banners[currentIndex] : defaultBanner;

    // Optional: Show a simple loader while simulating API attempt
    if (loading && banners.length === 0) {
        return <div className="hero-banner-container loading-state">Loading Banners...</div>;
    }

    return (
        <div className="hero-banner-container">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="hero-banner"
                >
                    {/* Background Decorative Elements */}
                    <div className="hero-banner-decor hero-banner-decor-top"></div>
                    <div className="hero-banner-decor hero-banner-decor-bottom"></div>

                    {/* Content Section */}
                    <div className="hero-banner-content">
                        {currentBanner.badge && (
                            <motion.span
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="hero-banner-badge"
                            >
                                {currentBanner.badge}
                            </motion.span>
                        )}

                        <motion.h2
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="hero-banner-title"
                        >
                            {currentBanner.title || 'Organic & Fresh'}
                            <br />
                            <span className="hero-banner-subtitle">
                                {currentBanner.subtitle || 'Delivered Daily'}
                            </span>
                        </motion.h2>

                        <motion.p
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="hero-banner-description"
                        >
                            {currentBanner.description || 'Shop the best quality vegetables and fruits directly from farmers.'}
                            {currentBanner.promoCode && (
                                <> Use code <b>{currentBanner.promoCode}</b>.</>
                            )}
                        </motion.p>

                        <motion.button
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="hero-banner-button"
                            onClick={() => currentBanner.link && (window.location.href = currentBanner.link)}
                        >
                            {currentBanner.buttonText || 'Shop Now'}
                        </motion.button>
                    </div>

                    {/* Graphic Section */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
                        className="hero-banner-graphic"
                    >
                        {currentBanner.image ? (
                            <img
                                src={currentBanner.image}
                                alt={currentBanner.title || 'Banner'}
                                className="hero-banner-image"
                                // Add error fallback for the image just in case
                                onError={(e) => {e.target.style.display='none'; e.target.parentNode.querySelector('.hero-banner-emoji').style.display='block';}}
                            />
                        ) : (
                            <span className="hero-banner-emoji">
                                {currentBanner.emoji || '🥦'}
                            </span>
                        )}
                    </motion.div>

                    {/* Navigation Arrows and Dots are now hidden as banners.length is 0 */}
                    {banners.length > 1 && (
                        <>
                            <button
                                className="hero-banner-arrow hero-banner-arrow-left"
                                onClick={handlePrevSlide}
                                aria-label="Previous banner"
                            >
                                ‹
                            </button>
                            <button
                                className="hero-banner-arrow hero-banner-arrow-right"
                                onClick={handleNextSlide}
                                aria-label="Next banner"
                            >
                                ›
                            </button>
                        </>
                    )}
                    {banners.length > 1 && (
                        <div className="hero-banner-pagination">
                            {banners.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleDotClick(index)}
                                    className={`hero-banner-dot ${index === currentIndex ? 'active' : ''}`}
                                    aria-label={`Go to banner ${index + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default HeroBanner;