import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ShoppingCart, ArrowRight, Zap, ShieldCheck, Star, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { fetchBanners } from '../../api/api';
import { getImageUrl } from '../../api/config';
import './HeroBanner.css';

// Import local assets as reliable fallbacks since backend images are giving 404
import imgMen from '../../assets/MEN.png';
import imgBig from '../../assets/big.png';
import imgBanner from '../../assets/banner.png';

const LOCAL_BANNERS = {
    'MEN.png': imgMen,
    'big.png': imgBig,
    'banner_1fBlQHN.png': imgBanner,
    'banner': imgBanner
};

/** Smart image fetcher with ngrok bypass & local fallbacks */
const useSmartBannerImage = (rawUrl) => {
    // 1. Resolve local fallbacks synchronously to avoid flicker/404 on first render
    const getInitialSrc = () => {
        if (!rawUrl) return null;
        const filename = rawUrl.split('/').pop();
        if (LOCAL_BANNERS[filename]) return LOCAL_BANNERS[filename];
        if (rawUrl.includes('MEN')) return imgMen;
        if (rawUrl.includes('big')) return imgBig;
        if (rawUrl.includes('banner')) return imgBanner;
        return null;
    };

    const [src, setSrc] = useState(getInitialSrc);

    useEffect(() => {
        if (!rawUrl) {
            setSrc(null);
            return;
        }

        // Check if already set by initial state to avoid redundant work
        const filename = rawUrl.split('/').pop();
        if (LOCAL_BANNERS[filename]) {
            setSrc(LOCAL_BANNERS[filename]);
            return;
        }
        if (rawUrl.includes('MEN')) { setSrc(imgMen); return; }
        if (rawUrl.includes('big')) { setSrc(imgBig); return; }
        if (rawUrl.includes('banner')) { setSrc(imgBanner); return; }

        let blobUrl = '';
        const load = async () => {
            try {
                // Try fetching with CORS-friendly headers
                const res = await fetch(rawUrl, {
                    headers: { 'ngrok-skip-browser-warning': 'true' }
                });
                if (res.ok) {
                    const ct = res.headers.get('content-type') || '';
                    if (ct.startsWith('image/')) {
                        const blob = await res.blob();
                        blobUrl = URL.createObjectURL(blob);
                        setSrc(blobUrl);
                        return;
                    }
                }
                // If fetch fails or not an image, use rawUrl (may still 404, handled by img tag)
                setSrc(rawUrl);
            } catch {
                setSrc(rawUrl);
            }
        };
        load();
        return () => { if (blobUrl) URL.revokeObjectURL(blobUrl); };
    }, [rawUrl]);

    return src;
};

const HeroBanner = () => {
    const [banners, setBanners] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadBanners = async () => {
            try {
                const data = await fetchBanners();
                const rawList = Array.isArray(data) ? data : (data?.results || []);
                if (rawList.length > 0) {
                    const activeOnes = rawList.filter(b => b.is_active === true || b.active === true);
                    const results = activeOnes.length > 0 ? activeOnes : rawList;
                    const processed = results.map(b => {
                        const rawImage = b.image || b.image_url || b.banner_image || b.img;
                        return { ...b, resolvedImage: getImageUrl(rawImage) };
                    });
                    setBanners(processed);
                }
            } catch (err) {
                console.error("Banner fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        loadBanners();
    }, []);

    useEffect(() => {
        if (banners.length > 1) {
            const timer = setInterval(() => {
                setCurrentIndex(prev => (prev + 1) % banners.length);
            }, 7000);
            return () => clearInterval(timer);
        }
    }, [banners]);

    const goTo = (dir) => {
        if (dir === 'prev') setCurrentIndex(prev => (prev - 1 + banners.length) % banners.length);
        else setCurrentIndex(prev => (prev + 1) % banners.length);
    };

    const handleShopNow = () => {
        document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    if (loading) return (
        <div className="hb-skeleton">
            <div className="hb-skeleton-shimmer"></div>
        </div>
    );

    if (!banners.length) return null;
    const b = banners[currentIndex % banners.length];

    return (
        <div className="hb-viewport">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7 }}
                    className="hb-slide"
                >
                    {/* BLURRED BACKDROP */}
                    <BannerBackdrop url={b.resolvedImage} />

                    <div className="hb-content">
                        {/* LEFT — TEXT */}
                        <div className="hb-text-side">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="hb-tag-line"
                            >
                                <Sparkles size={13} />
                                <span>{b.prize_offer || "EXCLUSIVE OFFER"}</span>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 25 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="hb-headline"
                            >
                                {b.title}
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35 }}
                                className="hb-description"
                            >
                                {b.description || "Discover premium products curated just for you. Shop the finest collection with confidence."}
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="hb-actions"
                            >
                                <button className="hb-shop-btn" onClick={handleShopNow}>
                                    <ShoppingCart size={18} />
                                    <span>Shop Now</span>
                                    <ArrowRight size={18} className="hb-btn-arrow" />
                                </button>

                                <div className="hb-stats-row">
                                    <div className="hb-stat">
                                        <TrendingUp size={14} />
                                        <span>50K+ Orders</span>
                                    </div>
                                    <div className="hb-stat">
                                        <Star size={14} fill="var(--primary-brand)" stroke="none" />
                                        <span>4.9 Rating</span>
                                    </div>
                                    <div className="hb-stat">
                                        <ShieldCheck size={14} />
                                        <span>Genuine</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* RIGHT — PRODUCT IMAGE */}
                        <motion.div
                            initial={{ opacity: 0, x: 60, rotate: 5 }}
                            animate={{ opacity: 1, x: 0, rotate: -2 }}
                            transition={{ duration: 0.8, delay: 0.15 }}
                            className="hb-image-side"
                        >
                            <BannerProductImage url={b.resolvedImage} title={b.title} />
                            <div className="hb-image-glow"></div>
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* NAV ARROWS */}
            {banners.length > 1 && (
                <>
                    <button className="hb-arrow left" onClick={() => goTo('prev')}>
                        <ChevronLeft size={20} strokeWidth={3} />
                    </button>
                    <button className="hb-arrow right" onClick={() => goTo('next')}>
                        <ChevronRight size={20} strokeWidth={3} />
                    </button>
                </>
            )}

            {/* PROGRESS DOTS */}
            {banners.length > 1 && (
                <div className="hb-progress">
                    {banners.map((_, idx) => (
                        <button
                            key={idx}
                            className={`hb-dot ${idx === currentIndex ? 'active' : ''}`}
                            onClick={() => setCurrentIndex(idx)}
                        >
                            <div className="hb-dot-fill"></div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

/** Blurred background backdrop */
const BannerBackdrop = ({ url }) => {
    const src = useSmartBannerImage(url);
    return (
        <div className="hb-backdrop-engine">
            <div className="hb-backdrop-img" style={{ backgroundImage: src ? `url(${src})` : 'none' }} />
            <div className="hb-backdrop-overlay" />
        </div>
    );
};

/** Main product image */
const BannerProductImage = ({ url, title }) => {
    const src = useSmartBannerImage(url);
    const [hasError, setHasError] = useState(false);

    // If we have a resolved source that isn't null, we show it
    // If it's null (not even 404 URL yet), we don't render to avoid broken icons
    if (!src && !url) return null;
    if (hasError) return null;

    return (
        <img
            src={src || url}
            alt={title || "Banner"}
            className="hb-product-img"
            onError={() => setHasError(true)}
        />
    );
};

export default HeroBanner;