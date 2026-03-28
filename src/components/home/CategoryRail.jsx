import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, ChevronRight, ChevronLeft, Sparkles, X, ImageIcon, Layers } from 'lucide-react';
import { fetchCategories, fetchSubCategories } from '../../api/api';
import { getImageUrl } from '../../api/config';
import { useSmartImage } from '../../api/imageService';
import './CategoryRail.css';

const CategoryRail = ({ onNavSelect }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [activeSub, setActiveSub] = useState(null);
  const [tertiarySubCategories, setTertiarySubCategories] = useState([]);
  const [activeTertiarySub, setActiveTertiarySub] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tertiaryLoading, setTertiaryLoading] = useState(false);

  // Scroll arrow state
  const scrollRef = useRef(null);
  const subScrollRef = useRef(null);
  const railContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [canSubScrollLeft, setCanSubScrollLeft] = useState(false);
  const [canSubScrollRight, setCanSubScrollRight] = useState(false);
  const tertiaryScrollRef = useRef(null);
  const [canTertiaryScrollLeft, setCanTertiaryScrollLeft] = useState(false);
  const [canTertiaryScrollRight, setCanTertiaryScrollRight] = useState(false);

  // Radium Pointer tracking
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e) => {
    if (!railContainerRef.current) return;
    const rect = railContainerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        const rawList = Array.isArray(data) ? data : (data?.results || []);
        const processed = rawList.map(cat => ({
          ...cat,
          // 🛡️ Data Priority: image_url is a functioning path, unlike the primary 'image' field
          displayImage: getImageUrl(cat.image_url || cat.image || cat.category_image || cat.img)
        }));
        setCategories(processed);
      } catch (err) {
        console.error("Categories fetch error:", err);
      }
    };
    loadCategories();
  }, []);

  const checkScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 10);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    }
    const subEl = subScrollRef.current;
    if (subEl) {
      setCanSubScrollLeft(subEl.scrollLeft > 10);
      setCanSubScrollRight(subEl.scrollLeft < subEl.scrollWidth - subEl.clientWidth - 10);
    }
    const tertEl = tertiaryScrollRef.current;
    if (tertEl) {
      setCanTertiaryScrollLeft(tertEl.scrollLeft > 10);
      setCanTertiaryScrollRight(tertEl.scrollLeft < tertEl.scrollWidth - tertEl.clientWidth - 10);
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScrollButtons();
    el.addEventListener('scroll', checkScrollButtons);
    window.addEventListener('resize', checkScrollButtons);
    return () => {
      el.removeEventListener('scroll', checkScrollButtons);
      window.removeEventListener('resize', checkScrollButtons);
    };
  }, [categories, checkScrollButtons]);

  useEffect(() => {
    const subEl = subScrollRef.current;
    if (!subEl) return;
    checkScrollButtons();
    subEl.addEventListener('scroll', checkScrollButtons);
    return () => {
      subEl.removeEventListener('scroll', checkScrollButtons);
    };
  }, [subCategories, checkScrollButtons]);

  useEffect(() => {
    const tertEl = tertiaryScrollRef.current;
    if (!tertEl) return;
    checkScrollButtons();
    tertEl.addEventListener('scroll', checkScrollButtons);
    return () => {
      tertEl.removeEventListener('scroll', checkScrollButtons);
    };
  }, [tertiarySubCategories, checkScrollButtons]);

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === 'left' ? -300 : 300, behavior: 'smooth' });
  };

  const subScroll = (direction) => {
    const el = subScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === 'left' ? -350 : 350, behavior: 'smooth' });
  };

  const tertiaryScroll = (direction) => {
    const el = tertiaryScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === 'left' ? -350 : 350, behavior: 'smooth' });
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSubCategories([]);
    setTertiarySubCategories([]);
    setActiveSub(null);
    setActiveTertiarySub(null);
    onNavSelect(null, null, null, null, false);
  };

  const handleCategorySelect = async (cat) => {
    if (selectedCategory?.id === cat.id) {
      handleBackToCategories();
      return;
    }

    setSelectedCategory(cat);
    setSubCategories([]);
    setTertiarySubCategories([]);
    setActiveSub(null);
    setActiveTertiarySub(null);
    setLoading(true);

    onNavSelect(cat.id, cat.name, null, null, false);

    try {
      const subs = await fetchSubCategories(cat.id);
      const topLevelSubs = (subs || []).filter(sub => !sub.parent_subcategory_id && !sub.parent_subcategory);
      setSubCategories(topLevelSubs);
    } catch (err) {
      console.error("Subcategories fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubSelect = async (sub) => {
    if (activeSub === sub.name) {
      setActiveSub(null);
      setTertiarySubCategories([]);
      setActiveTertiarySub(null);
      onNavSelect(selectedCategory.id, selectedCategory.name, null, null, false);
      return;
    }

    setActiveSub(sub.name);
    setTertiarySubCategories([]);
    setActiveTertiarySub(null);
    setTertiaryLoading(true);

    onNavSelect(selectedCategory.id, selectedCategory.name, sub.name, sub.id, false);

    try {
      const tertiary = await fetchSubCategories(null, sub.id);
      setTertiarySubCategories(tertiary || []);
    } catch (err) {
      console.error("Tertiary subcategories fetch error:", err);
    } finally {
      setTertiaryLoading(false);
    }
  };

  const handleTertiarySelect = (tert) => {
    setActiveTertiarySub(tert.name);
    onNavSelect(selectedCategory.id, selectedCategory.name, tert.name, tert.id, true);
  };

  return (
    <div
      className="category-rail-container"
      ref={railContainerRef}
      onMouseMove={handleMouseMove}
      style={{
        "--mouse-x": `${mousePos.x}px`,
        "--mouse-y": `${mousePos.y}px`
      }}
    >
      <div className="category-radium-glow"></div>
      <div className="category-rail-content">
        <div className="category-rail-header">
          <div className="category-rail-title">
            <LayoutGrid className="rail-icon" size={18} />
            <span>{selectedCategory ? `Browsing ${selectedCategory.name}` : 'Explore Categories'}</span>
          </div>
          {selectedCategory && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="clear-category-btn-elite"
              onClick={handleBackToCategories}
            >
              <ChevronLeft size={16} /> Back to Top Categories
            </motion.button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {!selectedCategory ? (
            <motion.div
              key="l0-rail"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="category-scroll-viewport"
            >
              <AnimatePresence>
                {canScrollLeft && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    className="scroll-arrow-btn left"
                    onClick={() => scroll('left')}
                  >
                    <ChevronLeft size={22} strokeWidth={3} />
                  </motion.button>
                )}
              </AnimatePresence>

              <div className="category-scroll-container no-scrollbar" ref={scrollRef} onScroll={checkScrollButtons}>
                {categories.map((cat) => (
                  <motion.div
                    key={cat.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCategorySelect(cat)}
                    className={`category-sector-card-elite ${selectedCategory?.id === cat.id ? 'active' : ''}`}
                  >
                    <div className="sector-shimmer-sweep"></div>
                    <div className="sector-visual-wrap">
                      <CategoryItemImage src={cat.displayImage} name={cat.name} />
                      <div className="sector-glass-overlay"></div>
                      {selectedCategory?.id === cat.id && (
                        <motion.div
                          layoutId="sector-active-glow"
                          className="sector-active-indicator"
                        />
                      )}
                    </div>
                    <div className="sector-info-luxe">
                      <span className="sector-name-luxe">{cat.name}</span>
                    </div>
                    <div className="sector-scanner-line"></div>
                  </motion.div>
                ))}
              </div>

              <AnimatePresence>
                {canScrollRight && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    className="scroll-arrow-btn right"
                    onClick={() => scroll('right')}
                  >
                    <ChevronRight size={22} strokeWidth={3} />
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {selectedCategory && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="sub-category-rail-premium"
            >
              <div className="sub-header-line-premium">
                <Sparkles size={16} className="sub-sparkle-icon" />
                <h3 className="sub-rail-title-premium">Popular in {selectedCategory.name}</h3>
              </div>

              <div className="sub-rail-viewport-luxury">
                <AnimatePresence>
                  {canSubScrollLeft && (
                    <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="sub-scroll-arrow-luxury left" onClick={() => subScroll('left')}><ChevronLeft size={20} /></motion.button>
                  )}
                </AnimatePresence>

                <div className="sub-scroll-container-premium no-scrollbar" ref={subScrollRef} onScroll={checkScrollButtons}>
                  {loading ? (
                    <div className="loading-pulse-container"><div className="pulse-dot"></div><div className="pulse-dot"></div><div className="pulse-dot"></div></div>
                  ) : (subCategories?.length || 0) > 0 ? (
                    subCategories.map((sub, idx) => (
                      <motion.div
                        key={sub.name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.04, type: "spring", damping: 15 }}
                        whileTap={{ scale: 0.95 }}
                        className={`subcategory-royal-card ${activeSub === sub.name ? 'active' : ''}`}
                        onClick={() => handleSubSelect(sub)}
                      >
                        <div className="sector-shimmer-sweep"></div>
                        <div className="sector-visual-wrap">
                          <CategoryItemImage src={sub.image || sub.displayImage} name={sub.name} />
                          <div className="sector-glass-overlay"></div>
                          {activeSub === sub.name && (
                            <motion.div layoutId="royalActiveRing" className="sector-active-indicator" />
                          )}
                        </div>
                        <div className="sector-info-luxe"><span className="sector-name-luxe">{sub.name}</span></div>
                        <div className="sector-scanner-line"></div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="no-sub-categories-message-premium">
                      <div className="empty-section-icon-wrap">
                        <Layers size={24} className="empty-section-icon" />
                        <div className="icon-radium-glow"></div>
                      </div>
                      <div className="empty-message-stack">
                        <h4 className="empty-message-title">Elite Sector Discovery</h4>
                        <p className="empty-message-subtitle">Our curators are currently assembling the premier collection for <strong>{selectedCategory.name}</strong>. Experience this curated journey soon.</p>
                      </div>
                    </div>
                  )}
                </div>

                <AnimatePresence>
                  {canSubScrollRight && (
                    <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="sub-scroll-arrow-luxury right" onClick={() => subScroll('right')}><ChevronRight size={20} /></motion.button>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {activeSub && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -20 }}
              className="sub-category-rail-premium tertiary"
            >
              <div className="sub-header-line-premium">
                <LayoutGrid size={14} className="sub-sparkle-icon" />
                <h4 className="sub-rail-title-premium">Refine within {activeSub}</h4>
              </div>

              <div className="sub-rail-viewport-luxury">
                <AnimatePresence>
                  {canTertiaryScrollLeft && (
                    <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="sub-scroll-arrow-luxury left" onClick={() => tertiaryScroll('left')}><ChevronLeft size={20} /></motion.button>
                  )}
                </AnimatePresence>

                <div className="sub-scroll-container-premium no-scrollbar" ref={tertiaryScrollRef} onScroll={checkScrollButtons}>
                  {tertiaryLoading ? (
                    <div className="loading-pulse-container"><div className="pulse-dot"></div><div className="pulse-dot"></div><div className="pulse-dot"></div></div>
                  ) : (tertiarySubCategories?.length || 0) > 0 ? (
                    tertiarySubCategories.map((tert, idx) => (
                      <motion.div
                        key={tert.name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`subcategory-royal-card tertiary ${activeTertiarySub === tert.name ? 'active' : ''}`}
                        onClick={() => handleTertiarySelect(tert)}
                      >
                        <div className="sector-shimmer-sweep"></div>
                        <div className="sector-visual-wrap tertiary">
                          <CategoryItemImage src={tert.image || tert.displayImage} name={tert.name} />
                          <div className="sector-glass-overlay"></div>
                          {activeTertiarySub === tert.name && (
                            <motion.div layoutId="tertActive" className="sector-active-indicator" />
                          )}
                        </div>
                        <div className="sector-info-luxe"><span className="sector-name-luxe tertiary">{tert.name}</span></div>
                        <div className="sector-scanner-line tertiary"></div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="no-sub-categories-message-premium tertiary">
                      <div className="empty-section-icon-wrap">
                        <LayoutGrid size={24} className="empty-section-icon" />
                        <div className="icon-radium-glow"></div>
                      </div>
                      <div className="empty-message-stack">
                        <h4 className="empty-message-title">Refinement in Progress</h4>
                        <p className="empty-message-subtitle">Curators are currently selecting specific refinements for <strong>{activeSub}</strong>. Check back soon for the full collection.</p>
                      </div>
                    </div>
                  )}
                </div>

                <AnimatePresence>
                  {canTertiaryScrollRight && (
                    <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="sub-scroll-arrow-luxury right" onClick={() => tertiaryScroll('right')}><ChevronRight size={20} /></motion.button>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const CategoryItemImage = ({ src: rawPath, name }) => {
  const { src } = useSmartImage(rawPath);
  return (
    <img
      src={src}
      alt={name}
      className="category-img-element"
      onError={(e) => {
        if (!e.target.src.includes('placehold.co')) {
          e.target.src = "https://placehold.co/100x100/1e293b/white?text=Collection";
        }
      }}
    />
  );
};

export default CategoryRail;