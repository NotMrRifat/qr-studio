import { FiTrash2, FiClock, FiRefreshCw } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function QRHistory({ items = [], onReuse, onDelete }) {
  if (items.length === 0) {
    return (
      <div className="history-section" style={{ textAlign: "center", padding: "20px 0" }}>
        <p style={{ opacity: 0.5, fontSize: "0.9rem" }}>No scan history yet. Generate some QR codes!</p>
      </div>
    );
  }

  return (
    <div className="history-section">
      <h3 style={{ fontSize: "1.1rem", marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
        <FiClock size={16} /> Recent QR Codes
      </h3>

      <div className="history-list">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="history-item"
            >
              <div className="history-info">
                <span className="history-type">{item.type}</span>
                <span className="history-data" title={item.data}>
                  {item.type === "wifi" ? `SSID: ${item.wifiSsid || "WiFi"}` : item.data}
                </span>
                <span className="history-date">
                  {new Date(item.timestamp).toLocaleDateString()} at{" "}
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              <div className="history-actions">
                <button
                  onClick={() => onReuse(item)}
                  className="icon-btn"
                  style={{ width: "32px", height: "32px" }}
                  title="Reuse QR Design & Data"
                >
                  <FiRefreshCw size={14} />
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="icon-btn"
                  style={{ width: "32px", height: "32px", color: "var(--accent)" }}
                  title="Delete from history"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
