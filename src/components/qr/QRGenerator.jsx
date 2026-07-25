import { useEffect, useRef, useState, useMemo } from "react";
import QRCodeStyling from "qr-code-styling";
import { 
  FiEdit3, 
  FiSliders, 
  FiImage, 
  FiFolder, 
  FiDownload, 
  FiShare2, 
  FiCopy, 
  FiUpload, 
  FiTrash2, 
  FiBookmark, 
  FiInfo 
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

// Custom UI Components
import Card from "../common/Card";
import Button from "../common/Button";
import QRHistory from "./QRHistory";
import QRFavorites from "./QRFavorites";

// Utilities & Data
import { generateQRValue } from "../../utils/qrHelpers";
import { qrTypes } from "../../data/qrTypes";
import {
  DOT_SHAPES,
  CORNER_SQUARE_STYLES,
  CORNER_DOT_STYLES,
  RESOLUTIONS,
  DEFAULT_PRESETS,
  DEFAULT_QR_STATE
} from "../../utils/qrConfig";

export default function QRGenerator() {
  const qrRef = useRef(null);
  const qrInstance = useRef(null);

  // Core configuration states
  const [qrState, setQrState] = useState(DEFAULT_QR_STATE);
  const [activeTab, setActiveTab] = useState("content");
  const [selectedResolution, setSelectedResolution] = useState(1024);

  // WiFi sub-states
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiEncryption, setWifiEncryption] = useState("WPA");

  // History & Presets Local Storage States
  const [historyItems, setHistoryItems] = useState(() => {
    const cached = localStorage.getItem("qr_history");
    return cached ? JSON.parse(cached) : [];
  });

  const [favoritePresets, setFavoritePresets] = useState(() => {
    const cached = localStorage.getItem("qr_favorites");
    return cached ? JSON.parse(cached) : [];
  });

  // Dynamically calculate the final raw text to write in the QR code
  const generatedValue = useMemo(() => {
    if (qrState.qrType === "wifi") {
      return generateQRValue("wifi", { ssid: wifiSsid, password: wifiPassword, encryption: wifiEncryption });
    }
    return generateQRValue(qrState.qrType, qrState.rawData);
  }, [qrState.qrType, qrState.rawData, wifiSsid, wifiPassword, wifiEncryption]);

  // Instantiate the QR Code Styling core canvas
  useEffect(() => {
    qrInstance.current = new QRCodeStyling({
      width: 280,
      height: 280,
      data: generatedValue || "https://stymetics.com",
      margin: qrState.margin,
      image: qrState.logo,
      qrOptions: {
        errorCorrectionLevel: "H",
      },
      dotsOptions: {
        type: qrState.dotType,
        color: qrState.dotColor,
        ...(qrState.colorType === "gradient" ? {
          gradient: {
            type: qrState.gradientType,
            rotation: qrState.gradientRotation * Math.PI / 180,
            colorStops: [
              { offset: 0, color: qrState.dotColor },
              { offset: 1, color: qrState.gradientColor }
            ]
          }
        } : {})
      },
      backgroundOptions: {
        color: qrState.transparentBg ? "rgba(0,0,0,0)" : qrState.bgColor,
      },
      cornersSquareOptions: {
        type: qrState.cornerSquareType,
        color: qrState.dotColor,
      },
      cornersDotOptions: {
        type: qrState.cornerDotType,
        color: qrState.dotColor,
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: qrState.logoMargin,
        imageSize: qrState.logoSize,
      }
    });

    const refVal = qrRef.current;
    if (refVal) {
      qrInstance.current.append(refVal);
    }

    return () => {
      if (refVal) {
        refVal.innerHTML = "";
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update QR options dynamically when any custom styling state changes
  useEffect(() => {
    if (!qrInstance.current) return;

    qrInstance.current.update({
      data: generatedValue || " ",
      margin: qrState.margin,
      image: qrState.logo,
      dotsOptions: {
        type: qrState.dotType,
        color: qrState.dotColor,
        gradient: qrState.colorType === "gradient" ? {
          type: qrState.gradientType,
          rotation: qrState.gradientRotation * Math.PI / 180,
          colorStops: [
            { offset: 0, color: qrState.dotColor },
            { offset: 1, color: qrState.gradientColor }
          ]
        } : null
      },
      backgroundOptions: {
        color: qrState.transparentBg ? "rgba(0,0,0,0)" : qrState.bgColor,
      },
      cornersSquareOptions: {
        type: qrState.cornerSquareType,
        color: qrState.dotColor,
      },
      cornersDotOptions: {
        type: qrState.cornerDotType,
        color: qrState.dotColor,
      },
      imageOptions: {
        margin: qrState.logoMargin,
        imageSize: qrState.logoSize,
      }
    });
  }, [
    generatedValue,
    qrState.margin,
    qrState.logo,
    qrState.dotType,
    qrState.dotColor,
    qrState.colorType,
    qrState.gradientType,
    qrState.gradientColor,
    qrState.gradientRotation,
    qrState.bgColor,
    qrState.transparentBg,
    qrState.cornerSquareType,
    qrState.cornerDotType,
    qrState.logoMargin,
    qrState.logoSize
  ]);

  // Log new code to history (Triggered on Download, Copy or Share)
  const saveToHistory = () => {
    const newItem = {
      id: Date.now().toString(),
      type: qrState.qrType,
      data: generatedValue,
      wifiSsid: wifiSsid,
      timestamp: Date.now(),
      // Snapshot state details
      ...qrState
    };
    
    const updated = [newItem, ...historyItems.slice(0, 19)]; // Limit to 20 recent
    setHistoryItems(updated);
    localStorage.setItem("qr_history", JSON.stringify(updated));
  };

  const handleReuseHistory = (item) => {
    // Populate form data back
    setQrState({
      qrType: item.qrType,
      rawData: item.rawData,
      dotType: item.dotType,
      cornerSquareType: item.cornerSquareType,
      cornerDotType: item.cornerDotType,
      colorType: item.colorType || "single",
      dotColor: item.dotColor,
      gradientType: item.gradientType || "linear",
      gradientColor: item.gradientColor || "#D7C4B1",
      gradientRotation: item.gradientRotation || 0,
      bgColor: item.bgColor || "#FFFFFF",
      transparentBg: item.transparentBg || false,
      margin: item.margin || 10,
      logo: item.logo || "",
      logoSize: item.logoSize || 0.3,
      logoMargin: item.logoMargin || 5
    });

    if (item.qrType === "wifi") {
      setWifiSsid(item.wifiSsid || "");
      setWifiPassword(item.wifiPassword || "");
      setWifiEncryption(item.wifiEncryption || "WPA");
    }
    setActiveTab("content");
  };

  const handleDeleteHistory = (id) => {
    const updated = historyItems.filter(item => item.id !== id);
    setHistoryItems(updated);
    localStorage.setItem("qr_history", JSON.stringify(updated));
  };

  // Preset Handlers
  const handleApplyPreset = (preset) => {
    setQrState(prev => ({
      ...prev,
      dotType: preset.dotType,
      cornerSquareType: preset.cornerSquareType,
      cornerDotType: preset.cornerDotType,
      colorType: preset.gradientType !== "none" ? "gradient" : "single",
      dotColor: preset.dotColor,
      gradientType: preset.gradientType !== "none" ? preset.gradientType : "linear",
      gradientColor: preset.gradientColor || "#D7C4B1",
      bgColor: preset.bgColor,
      transparentBg: preset.bgColor === "transparent" || preset.transparentBg,
      margin: preset.margin || 10
    }));
  };

  const handleSaveFavorite = (name) => {
    const newPreset = {
      id: Date.now().toString(),
      name,
      dotType: qrState.dotType,
      cornerSquareType: qrState.cornerSquareType,
      cornerDotType: qrState.cornerDotType,
      gradientType: qrState.colorType === "gradient" ? qrState.gradientType : "none",
      dotColor: qrState.dotColor,
      gradientColor: qrState.gradientColor,
      bgColor: qrState.transparentBg ? "transparent" : qrState.bgColor,
      margin: qrState.margin
    };

    const updated = [...favoritePresets, newPreset];
    setFavoritePresets(updated);
    localStorage.setItem("qr_favorites", JSON.stringify(updated));
  };

  const handleDeleteFavorite = (id) => {
    const updated = favoritePresets.filter(p => p.id !== id);
    setFavoritePresets(updated);
    localStorage.setItem("qr_favorites", JSON.stringify(updated));
  };

  // Logo Upload handlers
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setQrState(prev => ({ ...prev, logo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setQrState(prev => ({ ...prev, logo: "" }));
  };

  // Export handlers
  const handleDownload = async (format) => {
    if (!generatedValue) return;
    
    saveToHistory();

    const exportQr = new QRCodeStyling({
      width: selectedResolution,
      height: selectedResolution,
      data: generatedValue,
      margin: qrState.margin * (selectedResolution / 300), // scale margin proportionally
      image: qrState.logo,
      qrOptions: {
        errorCorrectionLevel: "H",
      },
      dotsOptions: {
        type: qrState.dotType,
        color: qrState.dotColor,
        ...(qrState.colorType === "gradient" ? {
          gradient: {
            type: qrState.gradientType,
            rotation: qrState.gradientRotation * Math.PI / 180,
            colorStops: [
              { offset: 0, color: qrState.dotColor },
              { offset: 1, color: qrState.gradientColor }
            ]
          }
        } : {})
      },
      backgroundOptions: {
        color: qrState.transparentBg ? "rgba(0,0,0,0)" : qrState.bgColor,
      },
      cornersSquareOptions: {
        type: qrState.cornerSquareType,
        color: qrState.dotColor,
      },
      cornersDotOptions: {
        type: qrState.cornerDotType,
        color: qrState.dotColor,
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: qrState.logoMargin * (selectedResolution / 300),
        imageSize: qrState.logoSize,
      }
    });

    await exportQr.download({
      name: `qr-studio-${selectedResolution}px`,
      extension: format
    });
  };

  const handleDownloadAll = async () => {
    await handleDownload("png");
    setTimeout(() => handleDownload("jpeg"), 350);
    setTimeout(() => handleDownload("svg"), 700);
  };

  const handleCopyImage = async () => {
    try {
      const canvas = qrRef.current.querySelector("canvas");
      if (!canvas) return;
      
      saveToHistory();
      
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob })
        ]);
        alert("Success! QR Code image copied to your clipboard.");
      }, "image/png");
    } catch (err) {
      console.warn("Clipboard writing error:", err);
      alert("Clipboard image copy failed. Please download the QR directly.");
    }
  };

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(generatedValue);
      saveToHistory();
      alert("Copied! QR data copied to clipboard.");
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = async () => {
    try {
      const canvas = qrRef.current.querySelector("canvas");
      if (!canvas) return;

      saveToHistory();

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], "elite-qr.png", { type: "image/png" });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: "Elite QR Code",
            text: "Check out this custom QR design made in Elite QR Generator."
          });
        } else {
          // Fallback
          navigator.clipboard.writeText(generatedValue);
          alert("Web sharing is not supported by your browser. QR data copied to clipboard!");
        }
      });
    } catch (err) {
      console.warn(err);
    }
  };

  return (
    <section id="generator" className="generator-section">
      <div className="container">
        <div className="section-title">
          <h2>Design & Generate</h2>
          <p>Tweak content, shape dots, embed a logo, and export in print resolutions.</p>
        </div>

        <div className="generator-grid">
          {/* Left Panel: Controls */}
          <Card className="generator-panel" hoverable={false}>
            {/* Tabs Selector */}
            <div className="controls-tabs">
              <button
                className={`tab-btn ${activeTab === "content" ? "active" : ""}`}
                onClick={() => setActiveTab("content")}
              >
                <FiEdit3 />
                <span>1. Content</span>
              </button>
              <button
                className={`tab-btn ${activeTab === "style" ? "active" : ""}`}
                onClick={() => setActiveTab("style")}
              >
                <FiSliders />
                <span>2. Appearance</span>
              </button>
              <button
                className={`tab-btn ${activeTab === "branding" ? "active" : ""}`}
                onClick={() => setActiveTab("branding")}
              >
                <FiImage />
                <span>3. Logo</span>
              </button>
              <button
                className={`tab-btn ${activeTab === "presets" ? "active" : ""}`}
                onClick={() => setActiveTab("presets")}
              >
                <FiFolder />
                <span>4. Presets</span>
              </button>
            </div>

            {/* TAB CONTENT: Content Inputs */}
            {activeTab === "content" && (
              <div>
                <h3 className="panel-title"><FiEdit3 /> QR Code Content</h3>
                
                {/* 10 Types Grid */}
                <div className="type-grid">
                  {qrTypes.map(t => {
                    const Icon = t.icon;
                    return (
                      <div
                        key={t.id}
                        className={`type-card ${qrState.qrType === t.id ? "active" : ""}`}
                        onClick={() => setQrState(prev => ({ ...prev, qrType: t.id }))}
                      >
                        <Icon />
                        <span>{t.name.split(" ")[0]}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Type Inputs */}
                {qrState.qrType !== "wifi" ? (
                  <div className="input-group">
                    <label className="input-label">
                      {qrTypes.find(t => t.id === qrState.qrType)?.name} Input
                    </label>
                    <textarea
                      className="input-field"
                      rows={3}
                      value={qrState.rawData}
                      onChange={(e) => setQrState(prev => ({ ...prev, rawData: e.target.value }))}
                      placeholder={qrTypes.find(t => t.id === qrState.qrType)?.placeholder}
                    />
                    
                    {qrState.qrType === "whatsapp" && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginTop: "8px",
                          color: "var(--accent)",
                          fontSize: "0.82rem",
                          fontWeight: 500
                        }}
                      >
                        <FaWhatsapp size={14} />
                        <span>Bangladesh numbers automatically normalized (+880...)</span>
                      </div>
                    )}
                  </div>
                ) : (
                  /* WiFi Config fields */
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div className="input-group">
                      <label className="input-label">Network SSID (Name)</label>
                      <input
                        type="text"
                        className="input-field"
                        value={wifiSsid}
                        onChange={(e) => setWifiSsid(e.target.value)}
                        placeholder="SSID name"
                      />
                    </div>
                    
                    <div className="input-group">
                      <label className="input-label">Password</label>
                      <input
                        type="text"
                        className="input-field"
                        value={wifiPassword}
                        onChange={(e) => setWifiPassword(e.target.value)}
                        placeholder="Network password"
                      />
                    </div>

                    <div className="input-group">
                      <label className="input-label">Security Encryption</label>
                      <div className="select-wrapper">
                        <select
                          className="input-field select-field"
                          value={wifiEncryption}
                          onChange={(e) => setWifiEncryption(e.target.value)}
                        >
                          <option value="WPA">WPA/WPA2</option>
                          <option value="WEP">WEP</option>
                          <option value="none">Open (No Security)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: Appearance Customize */}
            {activeTab === "style" && (
              <div>
                <h3 className="panel-title"><FiSliders /> QR Code Aesthetics</h3>

                {/* Dot Shape Selector */}
                <div className="input-group">
                  <label className="input-label">Dot Shape</label>
                  <div className="select-wrapper">
                    <select
                      className="input-field select-field"
                      value={qrState.dotType}
                      onChange={(e) => setQrState(prev => ({ ...prev, dotType: e.target.value }))}
                    >
                      {DOT_SHAPES.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Corner Styles */}
                <div className="color-row">
                  <div className="input-group">
                    <label className="input-label">Outer Eye Shape</label>
                    <div className="select-wrapper">
                      <select
                        className="input-field select-field"
                        value={qrState.cornerSquareType}
                        onChange={(e) => setQrState(prev => ({ ...prev, cornerSquareType: e.target.value }))}
                      >
                        {CORNER_SQUARE_STYLES.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Inner Eye Shape</label>
                    <div className="select-wrapper">
                      <select
                        className="input-field select-field"
                        value={qrState.cornerDotType}
                        onChange={(e) => setQrState(prev => ({ ...prev, cornerDotType: e.target.value }))}
                      >
                        {CORNER_DOT_STYLES.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Color Type Selector */}
                <div className="input-group">
                  <label className="input-label">Color Fill Style</label>
                  <div className="select-wrapper">
                    <select
                      className="input-field select-field"
                      value={qrState.colorType}
                      onChange={(e) => setQrState(prev => ({ ...prev, colorType: e.target.value }))}
                    >
                      <option value="single">Single Solid Color</option>
                      <option value="gradient">Gradient Color</option>
                    </select>
                  </div>
                </div>

                {/* Color Pickers */}
                {qrState.colorType === "single" ? (
                  <div className="input-group">
                    <label className="input-label">Dot Color</label>
                    <div className="color-input-wrapper">
                      <input
                        type="color"
                        className="custom-color-picker"
                        value={qrState.dotColor}
                        onChange={(e) => setQrState(prev => ({ ...prev, dotColor: e.target.value }))}
                      />
                      <span style={{ fontSize: "0.85rem", fontFamily: "monospace" }}>
                        {qrState.dotColor.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="color-row">
                      <div className="input-group">
                        <label className="input-label">Start Color</label>
                        <div className="color-input-wrapper">
                          <input
                            type="color"
                            className="custom-color-picker"
                            value={qrState.dotColor}
                            onChange={(e) => setQrState(prev => ({ ...prev, dotColor: e.target.value }))}
                          />
                          <span style={{ fontSize: "0.8rem", fontFamily: "monospace" }}>
                            {qrState.dotColor.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="input-group">
                        <label className="input-label">End Color</label>
                        <div className="color-input-wrapper">
                          <input
                            type="color"
                            className="custom-color-picker"
                            value={qrState.gradientColor}
                            onChange={(e) => setQrState(prev => ({ ...prev, gradientColor: e.target.value }))}
                          />
                          <span style={{ fontSize: "0.8rem", fontFamily: "monospace" }}>
                            {qrState.gradientColor.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="color-row">
                      <div className="input-group">
                        <label className="input-label">Gradient Type</label>
                        <div className="select-wrapper">
                          <select
                            className="input-field select-field"
                            value={qrState.gradientType}
                            onChange={(e) => setQrState(prev => ({ ...prev, gradientType: e.target.value }))}
                          >
                            <option value="linear">Linear</option>
                            <option value="radial">Radial</option>
                          </select>
                        </div>
                      </div>
                      {qrState.gradientType === "linear" && (
                        <div className="input-group">
                          <label className="input-label">Rotation ({qrState.gradientRotation}°)</label>
                          <input
                            type="range"
                            className="range-slider"
                            min="0"
                            max="360"
                            value={qrState.gradientRotation}
                            onChange={(e) => setQrState(prev => ({ ...prev, gradientRotation: parseInt(e.target.value) }))}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Background Setup */}
                <div className="toggle-row">
                  <span className="input-label" style={{ marginBottom: 0 }}>Transparent Background</span>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={qrState.transparentBg}
                      onChange={(e) => setQrState(prev => ({ ...prev, transparentBg: e.target.checked }))}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                {!qrState.transparentBg && (
                  <div className="input-group">
                    <label className="input-label">Background Color</label>
                    <div className="color-input-wrapper">
                      <input
                        type="color"
                        className="custom-color-picker"
                        value={qrState.bgColor}
                        onChange={(e) => setQrState(prev => ({ ...prev, bgColor: e.target.value }))}
                      />
                      <span style={{ fontSize: "0.85rem", fontFamily: "monospace" }}>
                        {qrState.bgColor.toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Margin slider */}
                <div className="input-group">
                  <label className="input-label">Quiet Zone Margin ({qrState.margin}px)</label>
                  <input
                    type="range"
                    className="range-slider"
                    min="0"
                    max="40"
                    value={qrState.margin}
                    onChange={(e) => setQrState(prev => ({ ...prev, margin: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
            )}

            {/* TAB CONTENT: Logo Embedding */}
            {activeTab === "branding" && (
              <div>
                <h3 className="panel-title"><FiImage /> Embed Logo</h3>

                {/* File Upload Box */}
                {!qrState.logo ? (
                  <div className="file-upload-box">
                    <FiUpload className="file-upload-icon" />
                    <p className="file-upload-text">Upload PNG, JPG, or SVG Logo</p>
                    <input
                      type="file"
                      className="file-upload-input"
                      accept="image/png, image/jpeg, image/svg+xml"
                      onChange={handleLogoUpload}
                    />
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "16px",
                        border: "1px solid var(--border-color)",
                        borderRadius: "var(--radius-md)",
                        background: "rgba(0,0,0,0.02)"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <img
                          src={qrState.logo}
                          alt="Logo Preview"
                          style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "8px",
                            objectFit: "contain",
                            border: "1px solid var(--border-color)",
                            background: "#fff"
                          }}
                        />
                        <div>
                          <p style={{ fontSize: "0.9rem", fontWeight: 600 }}>Centered Logo Active</p>
                          <p style={{ fontSize: "0.75rem", opacity: 0.6 }}>ErrorCorrection: High (Scannable)</p>
                        </div>
                      </div>
                      <Button variant="icon" onClick={handleRemoveLogo} style={{ color: "var(--accent)" }}>
                        <FiTrash2 size={16} />
                      </Button>
                    </div>

                    {/* Logo Size Control */}
                    <div className="input-group">
                      <label className="input-label">Logo Size Ratio ({Math.round(qrState.logoSize * 100)}%)</label>
                      <input
                        type="range"
                        className="range-slider"
                        min="0.1"
                        max="0.5"
                        step="0.05"
                        value={qrState.logoSize}
                        onChange={(e) => setQrState(prev => ({ ...prev, logoSize: parseFloat(e.target.value) }))}
                      />
                    </div>

                    {/* Logo Margin Control */}
                    <div className="input-group">
                      <label className="input-label">Logo Padding Margin ({qrState.logoMargin}px)</label>
                      <input
                        type="range"
                        className="range-slider"
                        min="0"
                        max="20"
                        value={qrState.logoMargin}
                        onChange={(e) => setQrState(prev => ({ ...prev, logoMargin: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: Presets & History */}
            {activeTab === "presets" && (
              <div>
                <h3 className="panel-title"><FiBookmark /> Templates & Library</h3>

                {/* Default presets quick apply */}
                <div className="input-group">
                  <label className="input-label">Luxury Theme Presets</label>
                  <div className="preset-row">
                    {DEFAULT_PRESETS.map(preset => (
                      <button
                        key={preset.id}
                        className="preset-chip"
                        onClick={() => handleApplyPreset(preset)}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ borderBottom: "1px solid var(--border-color)", margin: "20px 0" }} />

                {/* FavoritesPreserter */}
                <QRFavorites
                  favorites={favoritePresets}
                  onApply={handleApplyPreset}
                  onSaveCurrent={handleSaveFavorite}
                  onDelete={handleDeleteFavorite}
                />

                <div style={{ borderBottom: "1px solid var(--border-color)", margin: "20px 0" }} />

                {/* Local History */}
                <QRHistory
                  items={historyItems}
                  onReuse={handleReuseHistory}
                  onDelete={handleDeleteHistory}
                />
              </div>
            )}
          </Card>

          {/* Right Panel: Live Preview */}
          <div className="preview-sticky">
            <Card className="preview-panel" hoverable={false}>
              <h3 className="panel-title" style={{ justifyContent: "space-between" }}>
                <span>Live Preview</span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    padding: "4px 8px",
                    background: "rgba(99, 13, 22, 0.08)",
                    color: "var(--primary)",
                    borderRadius: "4px",
                    fontWeight: 700
                  }}
                >
                  HD ACTIVE
                </span>
              </h3>

              <div className="preview-container">
                {/* QR Canvas Container */}
                <div
                  className={`qr-canvas-wrapper ${qrState.transparentBg ? "transparent-bg" : ""}`}
                  ref={qrRef}
                />

                {/* Size options */}
                <div className="input-group" style={{ width: "100%", marginTop: "24px" }}>
                  <label className="input-label">Export Resolution ({selectedResolution}px)</label>
                  <div className="preset-row" style={{ justifyContent: "center" }}>
                    {RESOLUTIONS.map(res => (
                      <button
                        key={res.value}
                        className={`preset-chip ${selectedResolution === res.value ? "active" : ""}`}
                        onClick={() => setSelectedResolution(res.value)}
                      >
                        {res.value}px
                      </button>
                    ))}
                  </div>
                </div>

                {/* Download Actions */}
                <div className="action-grid">
                  <Button variant="secondary" onClick={() => handleDownload("png")} icon={FiDownload}>
                    Download PNG
                  </Button>
                  <Button variant="outline" onClick={() => handleDownload("svg")} icon={FiDownload}>
                    Download SVG
                  </Button>
                </div>

                <div className="action-grid" style={{ marginTop: "10px" }}>
                  <Button variant="outline" onClick={() => handleDownload("jpeg")} icon={FiDownload}>
                    Download JPG
                  </Button>
                  <Button variant="outline" onClick={handleDownloadAll} icon={FiDownload}>
                    Download All
                  </Button>
                </div>

                {/* Share Features Row */}
                <div className="share-options-row">
                  <button className="share-icon-btn" onClick={handleCopyImage} title="Copy QR Image to Clipboard">
                    <FiCopy />
                    <span>Copy Image</span>
                  </button>

                  <button className="share-icon-btn" onClick={handleShare} title="Share QR via System Application">
                    <FiShare2 />
                    <span>Share QR</span>
                  </button>

                  <button className="share-icon-btn" onClick={handleCopyLink} title="Copy encoded string link">
                    <FiCopy />
                    <span>Copy Content</span>
                  </button>
                </div>

                {/* Info Tip */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginTop: "20px",
                    background: "rgba(0,0,0,0.02)",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    width: "100%",
                    fontSize: "0.78rem",
                    color: "var(--text-secondary)"
                  }}
                >
                  <FiInfo size={14} style={{ flexShrink: 0, color: "var(--primary)" }} />
                  <span>Scanning relies on QR size and dots shapes. Validate code using camera before publishing.</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
