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
            }, 8500);
            return () => clearInterval(timer);
        }
    }, [banners]);

    const handleShopNow = () => {
        const productsElement = document.getElementById('products-section');
        if (productsElement) {
            productsElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

    if (loading) return (
        <div className="hb-skeleton">
            <div className="hb-skeleton-shimmer"></div>
        </div>
    );

    if (!banners.length) return null;

    return (
        <div className="hb-prime-wrapper">
            <div className="hb-stage-luxe">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                        className="hb-active-vanguard"
                    >
                        <div className="hb-vanguard-inner">
                            <BannerBackdrop url={banners[currentIndex].resolvedImage} />
                            
                            <div className="hb-vanguard-content">
                                <div className="hb-text-vanguard">
                                    <motion.div 
                                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                                        className="hb-promo-pill"
                                    >
                                        <Sparkles size={12} />
                                        <span>{banners[currentIndex].prize_offer || "LIMITED EDITION"}</span>
                                    </motion.div>

                                    <motion.h1 
                                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.6 }}
                                        className="hb-headline-vanguard"
                                    >
                                        {banners[currentIndex].title}
                                    </motion.h1>

                                    <motion.p 
                                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                                        className="hb-summary-vanguard"
                                    >
                                        {banners[currentIndex].description || "Unlocking the next dimension of luxury retail. Experience our high-fidelity discovery sectors with institution-grade logistics."}
                                    </motion.p>

                                    <motion.div 
                                        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }}
                                        className="hb-vanguard-actions"
                                    >
                                        <button className="hb-btn-discovery" onClick={handleShopNow}>
                                            <ShoppingCart size={18} />
                                            <span>Shop Now</span>
                                            <ArrowRight size={16} className="hb-arrow-discovery" />
                                        </button>
                                        
                                        <div className="hb-vanguard-stats">
                                            <div className="stat-node"><Zap size={12} /> <span>SHIPS INSTANTLY</span></div>
                                            <div className="stat-node"><Star size={12} fill="var(--elite-gold)" stroke="none" /> <span>ELITE GRADE</span></div>
                                        </div>
                                    </motion.div>
                                </div>

                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9, rotate: 2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 1.2, delay: 0.3 }}
                                    className="hb-visual-vanguard"
                                >
                                    <div className="hb-image-hub-luxe">
                                        <BannerProductImage url={banners[currentIndex].resolvedImage} title={banners[currentIndex].title} />
                                    </div>
                                    <div className="vanguard-orb"></div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* SIDE PEEK PROXIES — Subtle edge previews for continuity */}
                <div className="hb-edge-peek left" onClick={() => setCurrentIndex(prev => (prev - 1 + banners.length) % banners.length)}>
                    <div className="edge-glass">
                        <BannerBackdrop url={banners[(currentIndex - 1 + banners.length) % banners.length].resolvedImage} />
                    </div>
                </div>

                <div className="hb-edge-peek right" onClick={() => setCurrentIndex(prev => (prev + 1) % banners.length)}>
                    <div className="edge-glass">
                        <BannerBackdrop url={banners[(currentIndex + 1) % banners.length].resolvedImage} />
                    </div>
                </div>

                <div className="hb-vanguard-pagination-bar">
                    <button className="hb-nav-arrow left" onClick={() => setCurrentIndex(prev => (prev - 1 + banners.length) % banners.length)}>
                        <ChevronLeft size={20} />
                    </button>
                    
                    <div className="hb-pag-dots">
                        {banners.map((_, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => setCurrentIndex(idx)}
                                className={`hb-pag-orb ${currentIndex === idx ? 'active' : ''}`}
                            />
                        ))}
                    </div>

                    <button className="hb-nav-arrow right" onClick={() => setCurrentIndex(prev => (prev + 1) % banners.length)}>
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
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