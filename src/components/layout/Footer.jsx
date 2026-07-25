import { FaGlobe, FaTelegramPlane, FaGithub } from "react-icons/fa";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="footer" id="about">
      <div className="container footer-content">
        <div style={{ marginBottom: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
          <img
            src="/Logo.png"
            alt="Elite QR Logo"
            style={{ width: "48px", height: "48px", objectFit: "contain", borderRadius: "8px" }}
          />
          <span style={{ fontFamily: "Outfit, sans-serif", fontWeight: 800, fontSize: "1.2rem", color: "var(--primary)" }}>Elite QR Generator</span>
        </div>
        <p className="footer-text">Crafted with ❤️ by</p>

        <motion.a
          href="https://omarfaruk.eu.cc/"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-author"
          whileHover={{ scale: 1.05, y: -2 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          Rifat Hassan
        </motion.a>

        <div className="footer-title">
          Founder • Developer • Creator
        </div>

        <div className="footer-socials">
          <motion.a
            href="https://omarfaruk.eu.cc/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-social-btn"
            whileHover={{ y: -4, backgroundColor: "var(--primary)", color: "var(--background)" }}
            aria-label="Website"
          >
            <FaGlobe />
          </motion.a>

          <motion.a
            href="https://t.me/NotMrRifat"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-social-btn"
            whileHover={{ y: -4, backgroundColor: "var(--primary)", color: "var(--background)" }}
            aria-label="Telegram"
          >
            <FaTelegramPlane />
          </motion.a>

          <motion.a
            href="https://github.com/NotMrRifat"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-social-btn"
            whileHover={{ y: -4, backgroundColor: "var(--primary)", color: "var(--background)" }}
            aria-label="GitHub"
          >
            <FaGithub />
          </motion.a>
        </div>
      </div>
    </footer>
  );
}