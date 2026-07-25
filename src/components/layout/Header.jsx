import { useState, useEffect } from "react";
import { FiSun, FiMoon, FiMenu, FiX, FiDownload } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [isDark, setIsDark] = useState(() => {
    const cached = localStorage.getItem("theme");
    if (cached) return cached === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle dark mode side effects
  useEffect(() => {
    if (isDark) {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  // Handle PWA installation prompt
  useEffect(() => {
    const handleBeforePrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforePrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforePrompt);
    };
  }, []);

  const handleInstallApp = () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choice) => {
      if (choice.outcome === "accepted") {
        console.log("PWA Installed");
      }
      setDeferredPrompt(null);
    });
  };

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <>
      <header className="header">
        <div className="telegram-notice-banner">
          <span>⚡ Also available on Telegram: <a href="https://t.me/EliteQrGeneratorBot" target="_blank" rel="noopener noreferrer">@EliteQrGeneratorBot</a></span>
        </div>
        <div className="container nav">
          <a href="#" className="logo-container">
            <img
              src="/Logo.png"
              alt="Elite QR Logo"
              className="logo-icon"
              style={{ width: "32px", height: "32px", objectFit: "contain", borderRadius: "6px" }}
            />
            <span>Elite QR Generator</span>
          </a>

          {/* Desktop Navigation */}
          <nav className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#generator" className="nav-link">Generator</a>
            <a href="#projects" className="nav-link">Projects</a>
            <a href="#about" className="nav-link">About</a>
          </nav>

          <div className="nav-actions">
            {/* Dark/Light Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="icon-btn"
              aria-label="Toggle Theme"
            >
              {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>

            {/* PWA Install Button */}
            {deferredPrompt && (
              <button
                onClick={handleInstallApp}
                className="install-btn"
                aria-label="Install App"
              >
                <FiDownload size={16} />
                <span style={{ display: "inline" }}>Install App</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="icon-btn"
              style={{ display: "none" }} /* Hidden on desktop via CSS override in media query */
              aria-label="Toggle Menu"
              id="mobile-menu-toggle"
            >
              <FiMenu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* CSS fix for showing mobile menu button only on small screens */}
      <style>{`
        .telegram-notice-banner {
          background-color: var(--primary);
          color: var(--background);
          padding: 8px 16px;
          text-align: center;
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.2px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          transition: var(--transition);
        }
        body.dark .telegram-notice-banner {
          background-color: rgba(99, 13, 22, 0.4);
          color: var(--primary);
          border-bottom: 1px solid rgba(215, 196, 177, 0.1);
        }
        .telegram-notice-banner a {
          color: var(--secondary);
          text-decoration: underline;
          margin-left: 4px;
        }
        body.dark .telegram-notice-banner a {
          color: var(--dark);
        }
        @media (max-width: 768px) {
          #mobile-menu-toggle {
            display: flex !important;
          }
          .telegram-notice-banner {
            font-size: 0.78rem;
            padding: 6px 12px;
          }
        }
      `}</style>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mobile-nav-overlay"
          >
            <button onClick={toggleMobileMenu} className="mobile-nav-close">
              <FiX />
            </button>
            <a
              href="#features"
              onClick={toggleMobileMenu}
              className="mobile-nav-link"
            >
              Features
            </a>
            <a
              href="#generator"
              onClick={toggleMobileMenu}
              className="mobile-nav-link"
            >
              Generator
            </a>
            <a
              href="#projects"
              onClick={toggleMobileMenu}
              className="mobile-nav-link"
            >
              Projects
            </a>
            <a
              href="#about"
              onClick={toggleMobileMenu}
              className="mobile-nav-link"
            >
              About
            </a>
            
            {deferredPrompt && (
              <button
                onClick={() => {
                  handleInstallApp();
                  toggleMobileMenu();
                }}
                className="install-btn"
                style={{ marginTop: "20px" }}
              >
                <FiDownload size={16} />
                <span>Install App</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}