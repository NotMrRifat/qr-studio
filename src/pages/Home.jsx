import { motion } from "framer-motion";
import { FiSliders, FiHeart, FiCpu, FiEye, FiDownloadCloud, FiSmartphone } from "react-icons/fi";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import QRGenerator from "../components/qr/QRGenerator";
import Card from "../components/common/Card";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const features = [
    {
      icon: FiSliders,
      title: "Extensive Customization",
      desc: "Fine-tune dot shapes, outer/inner eye designs, background opacity, and margins for a distinct look."
    },
    {
      icon: FiDownloadCloud,
      title: "Print-Ready Exports",
      desc: "Download in web-standard PNG, vector-based SVG, or high-quality JPEG at 512px, 1024px, or 2048px."
    },
    {
      icon: FiCpu,
      title: "Brand Logo Embedding",
      desc: "Incorporate SVG or PNG logos at the center with high error correction safeguarding scannability."
    },
    {
      icon: FiSmartphone,
      title: "10 Formats Ready",
      desc: "Supports URLs, raw text, emails, phone numbers, auto-formatting BD WhatsApp links, WiFi configurations, and more."
    },
    {
      icon: FiHeart,
      title: "Presets & History",
      desc: "Save custom design configurations as templates and retrieve previously generated codes locally."
    },
    {
      icon: FiEye,
      title: "No Server Dependencies",
      desc: "100% private, client-side rendering with instant live updates. Data never leaves your device."
    }
  ];

  return (
    <div className="app">
      {/* Sticky Header */}
      <Header />

      {/* Floating Background Glows */}
      <div className="bg-animations">
        <div className="shape shape-1" />
        <div className="shape shape-2" />
        <div className="shape shape-3" />
      </div>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1>
              Create Beautiful
              <br />
              <span>QR Codes</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Generate stylish, customizable and professional QR codes instantly. Enhance your branding with custom shapes, colors, and logos.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            <button
              className="cta-btn"
              onClick={() =>
                document.getElementById("generator")?.scrollIntoView({
                  behavior: "smooth"
                })
              }
            >
              Start Creating
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: "80px 0" }}>
        <div className="container">
          <div className="section-title">
            <h2>Luxury Features</h2>
            <p>Tailored options for professionals, businesses, and branding creators.</p>
          </div>

          <motion.div 
            className="projects-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <Card key={i} className="project-card" delay={i * 0.1}>
                  <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
                    <div>
                      <div 
                        style={{ 
                          width: "50px", 
                          height: "50px", 
                          borderRadius: "12px", 
                          background: "rgba(99, 13, 22, 0.08)", 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center", 
                          color: "var(--primary)",
                          fontSize: "1.5rem",
                          marginBottom: "20px"
                        }}
                      >
                        <Icon />
                      </div>
                      <h3 style={{ fontSize: "1.35rem", marginBottom: "10px" }}>{feature.title}</h3>
                      <p style={{ fontSize: "0.92rem" }}>{feature.desc}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* QR Generator Panel Section */}
      <QRGenerator />

      {/* Projects Section */}
      <section id="projects" className="projects-section">
        <div className="container">
          <div className="section-title">
            <h2>Our Digital Ecosystem</h2>
            <p>Explore other projects and automation services crafted by StyMetics.</p>
          </div>

          <motion.div
            className="projects-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <Card className="project-card" delay={0.1}>
              <h3>StyMetics</h3>
              <p>Fashion & Lifestyle brand tailoring premium aesthetic wear and modern digital products.</p>
              <a href="https://stymetics.com" target="_blank" rel="noopener noreferrer" className="project-link">
                Visit Brand Website →
              </a>
            </Card>

            <Card className="project-card" delay={0.2}>
              <h3>Elite QR Generator</h3>
              <p>The standard-setting QR Code Generator Platform featuring high-resolution prints and client-side privacy.</p>
              <a href="#generator" className="project-link">
                Launch Generator →
              </a>
            </Card>

            <Card className="project-card" delay={0.3}>
              <h3>Telegram Solutions</h3>
              <p>State-of-the-art bot automations, database notifications, custom integrations, and system scripting services.</p>
              <a href="https://t.me/NotMrRifat" target="_blank" rel="noopener noreferrer" className="project-link">
                Hire Automation Services →
              </a>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Professional Footer */}
      <Footer />
    </div>
  );
}