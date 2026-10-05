import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Facebook,
  Twitter,
  Youtube,
  Instagram,
  ShoppingBag,
  Megaphone,
  Gift,
  HelpCircle,
  Mail,
  MapPin,
  Phone,
  Globe,
  Briefcase,
  ShieldCheck,
  CreditCard,
  Truck,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Cpu,
  X,
  FileText,
  LayoutGrid
} from "lucide-react";
import "./Footer.css";

// 📚 Detailed Content for Footer "Buttons"
// 📚 Structured Multi-Section Content for Footer Modals
const FOOTER_PAGE_DETAILS = {
  "Contact Us": {
    title: "Support Concierge",
    sections: [
      { subtitle: "Global Helpline", text: "Reach us 24/7 at 77088-05630 for urgent order inquiries." },
      { subtitle: "Digital Mailbox", text: "support@shopconnect.com — typical response time is 120 minutes." },
      { subtitle: "Live Consultation", text: "Visit our help center for instant chat support with our specialists." }
    ],
    icon: Phone,
    color: "#facc15"
  },
  "About Us": {
    title: "Our Heritage",
    sections: [
      { subtitle: "The Vision", text: "ShopConnect was founded to bridge the gap between artisan craftsmanship and global accessibility." },
      { subtitle: "Certified Trust", text: "Serving 100k+ patrons with a 99.8% satisfaction rating across the continent." },
      { subtitle: "Our Ethics", text: "100% Carbon-neutral delivery operations by 2026." }
    ],
    icon: ShoppingBag,
    color: "#38bdf8"
  },
  "Terms of Use": {
    title: "Universal Service Agreement",
    sections: [
      { subtitle: "I. Acceptance", text: "By engaging with ShopConnect, you enter a binding agreement to adhere to our fair-trade and digital safety standards." },
      { subtitle: "II. User Conduct", text: "We maintain a zero-tolerance policy for fraudulent transactions and automated scraping operations." },
      { subtitle: "III. IP Rights", text: "All brand assets and product photography are protected under international copyright law." }
    ],
    icon: FileText,
    color: "#fbbf24"
  },
  "Privacy Policy": {
    title: "Data Sovereignty",
    sections: [
      { subtitle: "Encryption", text: "Military-grade 256-bit SSL encryption protects every byte of your personal information." },
      { subtitle: "Privacy Promise", text: "We never monetize user data. Your browsing history is yours and yours alone." },
      { subtitle: "Cookies", text: "We use performance cookies only to enhance your boutique shopping experience." }
    ],
    icon: ShieldCheck,
    color: "#10b981"
  },
  "Shipping": {
    title: "Logistics Excellence",
    sections: [
      { subtitle: "Priority Lane", text: "Metro-deliveries within 24-48 hours via our dedicated air-freight partners." },
      { subtitle: "Full Tracking", text: "Real-time granular tracking from our hub to your doorstep via SMS/Email." },
      { subtitle: "Global Reach", text: "Now shipping to over 200 territories with dedicated customs concierge support." }
    ],
    icon: Truck,
    color: "#f59e0b"
  },
  "Returns": {
    title: "Satisfaction Guarantee",
    sections: [
      { subtitle: "7-Day Window", text: "Hassle-free returns initiated directly from your 'My Orders' dashboard." },
      { subtitle: "Auto-Picking", text: "Free doorstep pickup for all return-eligible items across all zip codes." },
      { subtitle: "Instant Credit", text: "Refunds processed to source within 3-5 business days post-verification." }
    ],
    icon: RotateCcw,
    color: "#f43f5e"
  },
  "Careers": {
    title: "Global Talent Acquisition",
    sections: [
      { subtitle: "Join the Vision", text: "We are always looking for pioneers in AI, Logistics, and Creative Design to join our high-performance teams." },
      { subtitle: "Culture of Excellence", text: "Flexible remote-first architecture with dedicated growth stipends for every elite member." },
      { subtitle: "Open Sectors", text: "Current openings in Engineering, Product Management, and Global Supply Chain." }
    ],
    icon: Briefcase,
    color: "#8b5cf6"
  },
  "Our Story": {
    title: "The Kuiky Journey",
    sections: [
      { subtitle: "Inception", text: "Founded in 2023 with a mission to revolutionize the digital procurement landscape through institutional-grade technology." },
      { subtitle: "Milestones", text: "Now serving over 500k+ active patrons with 50+ localized distribution sectors." },
      { subtitle: "Future Protocol", text: "Expanding into sustainable AR-driven shopping environments by late 2026." }
    ],
    icon: Globe,
    color: "#06b6d4"
  },
  "Payments": {
    title: "Financial Security Protocol",
    sections: [
      { subtitle: "Encrypted Transactions", text: "100% of payment data is processed through PCI-DSS Level 1 certified gateways." },
      { subtitle: "Diverse Methods", text: "Accepting Global Credit/Debit, UPI, and Institutional Net Banking." },
      { subtitle: "Secure Checkout", text: "Your credentials are never stored on our local cloud nodes." }
    ],
    icon: CreditCard,
    color: "#f59e0b"
  },
  "Security": {
    title: "Secure Access",
    sections: [
      { subtitle: "Zero Trust", text: "Verified multi-factor protocol." },
      { subtitle: "AI Defense", text: "24/7 internal threat detection." }
    ],
    icon: ShieldCheck,
    color: "#f59e0b"
  },
  "Press": {
    title: "Media Hub",
    sections: [
      { subtitle: "Inquiries", text: "media@shopconnect.com" },
      { subtitle: "Assets", text: "Official Kuiky visual kits." }
    ],
    icon: Megaphone,
    color: "#f59e0b"
  },
  "Sitemap": {
    title: "Quick Map",
    sections: [
      { subtitle: "Access", text: "Direct paths to My Bag and UI Hub." },
      { subtitle: "Index", text: "Structural department indexing." }
    ],
    icon: LayoutGrid,
    color: "#f59e0b"
  },
  "Order Status": {
    title: "Live Tracking",
    sections: [
      { subtitle: "Flow", text: "Real-time procurement updates." },
      { subtitle: "Alerts", text: "SMS and digital mail sync." }
    ],
    icon: Cpu,
    color: "#f59e0b"
  },
  "Compliance": {
    title: "Standards",
    sections: [
      { subtitle: "ISO 27001", text: "Full data safety compliance." },
      { subtitle: "Regulatory", text: "Rules of E-Commerce 2024." }
    ],
    icon: ShieldCheck,
    color: "#f59e0b"
  }
};

const FOOTER_DATA = {
  about: {
    id: "about",
    title: "ABOUT",
    links: ["Contact Us", "About Us", "Careers", "Press", "Our Story"]
  },
  help: {
    id: "help",
    title: "HELP",
    links: ["Payments", "Shipping", "Returns", "FAQ", "Order Status"]
  },
  policy: {
    id: "policy",
    title: "CONSUMER POLICY",
    links: ["Terms of Use", "Privacy Policy", "Security", "Sitemap", "Compliance"]
  },
  socials: [
    { icon: Facebook, href: "#", color: "#1877F2" },
    { icon: Twitter, href: "#", color: "#1DA1F2" },
    { icon: Youtube, href: "#", color: "#FF0000" },
    { icon: Instagram, href: "#", color: "#E4405F" }
  ]
};

const Footer = () => {
  // 💎 INTELLIGENT VIEWPORT SYNC: Collapse sections on mobile to prevent "Infinite Scroll"
  const isMobileInitial = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  const [openSections, setOpenSections] = useState({ 
    about: !isMobileInitial, 
    help: !isMobileInitial, 
    policy: !isMobileInitial,
    mail: !isMobileInitial,
    office: !isMobileInitial
  });
  const [activeDetail, setActiveDetail] = useState(null);

  const toggleSection = (id) => setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  const showDetail = (label) => {
      const detail = FOOTER_PAGE_DETAILS[label];
      if (detail) setActiveDetail({ ...detail, label });
      else alert(`${label} details are being updated. Please check back later.`);
  };

  return (
    <footer className="footer-premium">
      <div className="footer-top-accent"></div>

      <div className="footer-main-content">
        {/* ONE ROW LAYOUT FOR ALL 5 SECTIONS */}
        <div className="footer-grid-container-flat">
          
          {/* 1. ABOUT */}
          <FooterSection 
             section={FOOTER_DATA.about} 
             isOpen={openSections[FOOTER_DATA.about.id]} 
             onToggle={() => toggleSection(FOOTER_DATA.about.id)}
             onLinkClick={showDetail}
          />

          {/* 2. HELP */}
          <FooterSection 
             section={FOOTER_DATA.help} 
             isOpen={openSections[FOOTER_DATA.help.id]} 
             onToggle={() => toggleSection(FOOTER_DATA.help.id)}
             onLinkClick={showDetail}
          />

          {/* 3. POLICY */}
          <FooterSection 
             section={FOOTER_DATA.policy} 
             isOpen={openSections[FOOTER_DATA.policy.id]} 
             onToggle={() => toggleSection(FOOTER_DATA.policy.id)}
             onLinkClick={showDetail}
          />

          {/* 4. MAIL US */}
          <div className={`footer-section-flat ${openSections.mail ? 'is-open' : ''}`}>
            <button className="section-title-btn" onClick={() => toggleSection('mail')}>
              <span>MAIL US</span>
              <div className="title-icon-wrap mobile-only">
                {openSections.mail ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>
            <AnimatePresence initial={false}>
              {openSections.mail && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} 
                  animate={{ height: "auto", opacity: 1 }} 
                  exit={{ height: 0, opacity: 0 }} 
                  className="contact-details"
                  style={{ overflow: "hidden" }}
                >
                  <p>Thiran360AI Private Limited,</p>
                  <p>Kullampalayam, CFX3+8J,</p>
                  <p>Gobichettipalayam, TN 638476, India</p>
                  <div className="social-mini-row">
                    <span className="social-label">SOCIAL</span>
                    <div className="social-icons-wrap">
                      {FOOTER_DATA.socials.map((soc, i) => (
                        <motion.a 
                          key={i}
                          whileHover={{ y: -4, color: soc.color, scale: 1.1 }}
                          href={soc.href} 
                          className="social-icon-btn"
                        >
                          <soc.icon size={18} />
                        </motion.a>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 5. REGISTERED OFFICE */}
          <div className={`footer-section-flat ${openSections.office ? 'is-open' : ''}`}>
            <button className="section-title-btn" onClick={() => toggleSection('office')}>
              <span>REGISTERED OFFICE</span>
              <div className="title-icon-wrap mobile-only">
                {openSections.office ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>
            <AnimatePresence initial={false}>
              {openSections.office && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} 
                  animate={{ height: "auto", opacity: 1 }} 
                  exit={{ height: 0, opacity: 0 }} 
                  className="contact-details"
                  style={{ overflow: "hidden" }}
                >
                  <p>Thiran360AI Private Limited,</p>
                  <p>Madivala, Bengaluru – 560103</p>
                  <p className="phone-line">
                    <Phone size={14} /> 
                    <span>77088-05630</span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="footer-bottom-strip">
        <div className="bottom-strip-inner">
          <div className="footer-utility-links">
            <button className="util-btn"><Briefcase size={16} /> Seller</button>
            <button className="util-btn"><Megaphone size={16} /> Advertise</button>
            <button className="util-btn"><Gift size={16} /> Gift Cards</button>
            <button className="util-btn" onClick={() => showDetail("Contact Us")}><HelpCircle size={16} /> Help</button>
          </div>
          
          <div className="footer-credit-hub">
            <div className="thiran-badge">
              <Cpu size={14} className="badge-icon" />
              <span>Created by <strong>Thiran360AI</strong></span>
            </div>
            <div className="footer-legal-copy">
              <Globe size={16} className="world-icon" />
              <span>© 2026 Kuiky. All rights reserved.</span>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {activeDetail && (
          <div className="footer-detail-overlay">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overlay-backdrop" onClick={() => setActiveDetail(null)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", damping: 20 }} className="detail-card-premium">
              <button className="close-overlay" onClick={() => setActiveDetail(null)}><X size={24} /></button>
              
              <div className="detail-modal-header-luxe">
                  {/* 🏆 CERTIFICATE OF TRUST BADGE */}
                  <div className="trust-badge-mini">
                    <ShieldCheck size={12} />
                    <span>OFFICIAL VERIFIED DOCUMENT</span>
                  </div>

                  <div className="detail-visual-header" style={{ "--item-color": activeDetail.color }}>
                    <div className="detail-icon-box"><activeDetail.icon size={48} strokeWidth={1} /></div>
                    <h3>{activeDetail.title}</h3>
                    <div className="header-divider-gold"></div>
                  </div>
              </div>

              <div className="detail-body-luxury">
                {activeDetail.sections.map((sec, i) => (
                  <div key={i} className="detail-section-glass">
                    <h4>{sec.subtitle}</h4>
                    <p>{sec.text}</p>
                  </div>
                ))}
              </div>

              <div className="detail-footer-premium">
                <button className="detail-action-btn-luxe" onClick={() => setActiveDetail(null)}>
                  Understood & Accept
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
};

const FooterSection = ({ section, isOpen, onToggle, onLinkClick }) => (
  <div className={`footer-section-flat ${isOpen ? 'is-open' : ''}`}>
    <button className="section-title-btn" onClick={onToggle}>
      <span>{section.title}</span>
      <div className="title-icon-wrap mobile-only">
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </div>
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.ul 
          initial={{ height: 0, opacity: 0 }} 
          animate={{ height: "auto", opacity: 1 }} 
          exit={{ height: 0, opacity: 0 }} 
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="footer-list"
          style={{ overflow: "hidden" }}
        >
          {section.links.map(label => (
            <li key={label}><button onClick={() => onLinkClick(label)} className="footer-link-btn">{label}</button></li>
          ))}
        </motion.ul>
      )}
    </AnimatePresence>
  </div>
);

const FeatureItem = ({ icon: Icon, title, desc }) => (
  <div className="feature-pill">
    <Icon size={20} />
    <div className="feature-text">
      <span>{title}</span>
      <p>{desc}</p>
    </div>
  </div>
);

export default Footer;
