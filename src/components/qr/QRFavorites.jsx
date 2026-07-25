import { useState } from "react";
import { FiStar, FiPlus, FiTrash2 } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function QRFavorites({ favorites = [], onApply, onSaveCurrent, onDelete }) {
  const [presetName, setPresetName] = useState("");

  const handleSave = (e) => {
    e.preventDefault();
    if (!presetName.trim()) return;
    onSaveCurrent(presetName.trim());
    setPresetName("");
  };

  return (
    <div className="presets-section">
      <h3 style={{ fontSize: "1.1rem", marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
        <FiStar size={16} /> Favorite Style Presets
      </h3>

      {/* Add New Preset Form */}
      <form onSubmit={handleSave} style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
        <input
          type="text"
          className="input-field"
          placeholder="Name this style..."
          value={presetName}
          onChange={(e) => setPresetName(e.target.value)}
          style={{ padding: "8px 12px", fontSize: "0.85rem", flex: 1 }}
        />
        <button
          type="submit"
          className="action-btn btn-primary"
          style={{
            padding: "8px 14px",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            height: "100%",
            borderRadius: "var(--radius-sm)"
          }}
        >
          <FiPlus /> Save
        </button>
      </form>

      {/* Preset List */}
      {favorites.length === 0 ? (
        <p style={{ opacity: 0.5, fontSize: "0.85rem", textAlign: "center", padding: "10px 0" }}>
          No custom presets saved. Adjust the style options above and name/save them!
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <AnimatePresence>
            {favorites.map((preset) => (
              <motion.div
                key={preset.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(0, 0, 0, 0.02)",
                  border: "1px solid var(--border-color)"
                }}
              >
                <button
                  onClick={() => onApply(preset)}
                  style={{
                    background: "none",
                    border: "none",
                    fontFamily: "inherit",
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    cursor: "pointer",
                    textAlign: "left",
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      background: preset.dotColor || "var(--primary)"
                    }}
                  />
                  {preset.name}
                </button>

                <button
                  onClick={() => onDelete(preset.id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--accent)",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center"
                  }}
                  title="Delete preset"
                >
                  <FiTrash2 size={14} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
