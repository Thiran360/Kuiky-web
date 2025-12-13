import React from "react";
import {
  Facebook,
  Twitter,
  Youtube,
  Instagram,
  ShoppingBag,
  Megaphone,
  Gift,
  HelpCircle,
} from "lucide-react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      {/* TOP */}
      <div className="footer-top">
        <div className="footer-grid">
<div className="footer-address-row">
    <div className="footer-col">
            <h4>ABOUT</h4>
            <a>Contact Us</a>
            <a>About Us</a>
            <a>Careers</a>
            <a>Press</a>
          </div>

          <div className="footer-col">
            <h4>GROUP COMPANIES</h4>
            <a>Myntra</a>
            <a>Cleartrip</a>
            <a>Shopsy</a>
          </div></div>
          
        
<div className="footer-address-row">
    <div className="footer-col">
            <h4>HELP</h4>
            <a>Payments</a>
            <a>Shipping</a>
            <a>Returns</a>
            <a>FAQ</a>
          </div>

          <div className="footer-col">
            <h4>CONSUMER POLICY</h4>
            <a>Terms</a>
            <a>Privacy</a>
            <a>Security</a>
          </div>
</div>
          

          {/* 🔥 ADDRESS ROW (FIXED) */}
          <div className="footer-address-row">
            <div className="footer-col footer-address">
              <h4>MAIL US</h4>
              <p>
                Thiran360AI Private Limited,<br />
                CFX3+8J, &<br />
                Kullampalayam,<br />
                Gobichettipalayam,<br />
                Tamil Nadu 638476, India
              </p>

              <h4 className="mt">SOCIAL</h4>
              <div className="footer-social">
                <Facebook size={14} />
                <Twitter size={14} />
                <Youtube size={14} />
                <Instagram size={14} />
              </div>
            </div>

            <div className="footer-col footer-address">
              <h4>REGISTERED OFFICE</h4>
              <p>
                Thiran360AI Private Limited,<br />
                Madivala,<br />
                Bengaluru – 560103<br />
                <span>93844-42434</span>
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* BOTTOM */}
      <div className="footer-bottom">
        <div className="footer-bottom-left">
          <span><ShoppingBag size={14}/> Seller</span>
          <span><Megaphone size={14}/> Advertise</span>
          <span><Gift size={14}/> Gift Cards</span>
          <span><HelpCircle size={14}/> Help</span>
        </div>
        <div className="footer-bottom-right">
          © 2025 Ecom
        </div>
      </div>
    </footer>
  );
};

export default Footer;
