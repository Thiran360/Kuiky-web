import React, { useState, useEffect } from 'react';
import { getImageUrl } from '../../api/config'; // 🟢 Updated import name
import { fetchBanners } from '../../api/api'; // 🟢 Updated import path
import { ChevronLeft, ChevronRight, Loader, Tag } from 'lucide-react';

const BannerCarousel = () => {
    const [banners, setBanners] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. Fetch Banners on Load
    useEffect(() => {
        const loadBanners = async () => {
            try {
                // 🟢 Updated function call
                const data = await fetchBanners();
                
                // Safety check: ensure data is an array before filtering
                const activeBanners = Array.isArray(data) ? data.filter(b => b.is_active) : [];
                setBanners(activeBanners);
            } catch (err) {
                console.error("Failed to load banners:", err);
                setError("Failed to load offers.");
            } finally {
                setLoading(false);
            }
        };
        loadBanners();
    }, []);

    // 2. Auto-Slide Logic (Runs every 5 seconds)
    useEffect(() => {
        if (banners.length <= 1) return; 

        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => 
                prevIndex === banners.length - 1 ? 0 : prevIndex + 1
            );
        }, 5000);

        return () => clearInterval(timer);
    }, [banners.length]);

    // 3. Navigation Functions
    const nextSlide = () => {
        setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
    };

    const goToSlide = (index) => {
        setCurrentIndex(index);
    };

    // --- Loading & Error States ---
    if (loading) {
        return (
            <div className="banner-skeleton">
                <Loader className="spin" size={24} />
                <style>{`
                    .banner-skeleton {
                        width: 100%;
                        max-width: 1200px;
                        aspect-ratio: 16/7;
                        margin: 20px auto;
                        background: #eee;
                        border-radius: 16px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .spin { animation: spin 1s linear infinite; color: #888; }
                    @keyframes spin { 100% { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    if (error || banners.length === 0) {
        return null; 
    }

    return (
        <div className="carousel-container">
            {/* --- Inline CSS --- */}
            <style>{`
                .carousel-container {
                    position: relative;
                    width: 100%;
                    max-width: 1200px;
                    margin: 20px auto;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
                    background: #000;
                    aspect-ratio: 16/7;
                }

                @media (max-width: 768px) {
                    .carousel-container {
                        aspect-ratio: 16/9;
                        margin: 10px auto;
                        border-radius: 12px;
                    }
                }

                .carousel-slide {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    opacity: 0;
                    transition: opacity 0.8s ease-in-out;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .carousel-slide.active {
                    opacity: 1;
                    z-index: 1;
                }

                .banner-image {
                    width: 100%;
                    height: 100%;
                    // object-fit: cover;
                    filter: brightness(0.75); 
                }

                .banner-content {
                    position: absolute;
                    bottom: 40px;
                    left: 40px;
                    right: 40px;
                    z-index: 2;
                    color: white;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.8);
                }

                .banner-tag {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: #ffd700;
                    color: #000;
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-weight: 700;
                    font-size: 14px;
                    margin-bottom: 12px;
                    text-transform: uppercase;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                }

                .banner-title {
                    font-size: 36px;
                    font-weight: 800;
                    margin: 0 0 8px 0;
                    line-height: 1.1;
                }

                .banner-desc {
                    font-size: 18px;
                    font-weight: 400;
                    opacity: 0.9;
                    max-width: 600px;
                }

                @media (max-width: 768px) {
                    .banner-content { bottom: 20px; left: 20px; right: 20px; }
                    .banner-title { font-size: 24px; }
                    .banner-desc { font-size: 14px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                }

                .nav-btn {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(5px);
                    border: none;
                    color: white;
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    cursor: pointer;
                    z-index: 10;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                }

                .nav-btn:hover {
                    background: #fff;
                    color: #000;
                }

                .prev-btn { left: 20px; }
                .next-btn { right: 20px; }

                .carousel-dots {
                    position: absolute;
                    bottom: 15px;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    gap: 8px;
                    z-index: 10;
                }

                .dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .dot.active {
                    background: #ffd700;
                    transform: scale(1.2);
                    width: 24px;
                    border-radius: 10px;
                }
            `}</style>

            {banners.map((banner, index) => (
                <div 
                    key={banner.id} 
                    className={`carousel-slide ${index === currentIndex ? 'active' : ''}`}
                >
                    <img 
                        src={getImageUrl(banner.image)} 
                        alt={banner.title} 
                        className="banner-image"
                        onError={(e) => {
                            e.target.src = "https://via.placeholder.com/1200x500?text=Offer"; // Fallback
                        }}
                    />
                    
                    <div className="banner-content">
                        {banner.prize_offer && (
                            <div className="banner-tag">
                                <Tag size={14} />
                                {banner.prize_offer}
                            </div>
                        )}
                        <h2 className="banner-title">{banner.title}</h2>
                        <p className="banner-desc">{banner.description}</p>
                    </div>
                </div>
            ))}

            {banners.length > 1 && (
                <>
                    <button className="nav-btn prev-btn" onClick={prevSlide}>
                        <ChevronLeft size={24} />
                    </button>
                    <button className="nav-btn next-btn" onClick={nextSlide}>
                        <ChevronRight size={24} />
                    </button>

                    <div className="carousel-dots">
                        {banners.map((_, index) => (
                            <span 
                                key={index} 
                                className={`dot ${index === currentIndex ? 'active' : ''}`}
                                onClick={() => goToSlide(index)}
                            ></span>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default BannerCarousel;