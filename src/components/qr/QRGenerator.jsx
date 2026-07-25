import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import QRCodeStyling from "qr-code-styling";
import jsQR from "jsqr";
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
  FiInfo,
  FiCheckCircle,
  FiXCircle
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// Custom UI Components
import Card from "../common/Card";
import Button from "../common/Button";
import QRHistory from "./QRHistory";

// Utilities & Data
import { generateQRValue } from "../../utils/qrHelpers";
import { qrTypes } from "../../data/qrTypes";
import {
  DOT_SHAPES,
  CORNER_SQUARE_STYLES,
  CORNER_DOT_STYLES,
  RESOLUTIONS,
  DEFAULT_QR_STATE,
  QR_TEMPLATES
} from "../../utils/qrConfig";

export default function QRGenerator() {
  const qrRef = useRef(null);
  const qrInstance = useRef(null);

  // Core configuration states
  const [qrState, setQrState] = useState(DEFAULT_QR_STATE);
  const [activeTab, setActiveTab] = useState("content");
  const [selectedResolution, setSelectedResolution] = useState(1024);
  const [isLoading, setIsLoading] = useState(false);

  // WiFi sub-states
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiEncryption, setWifiEncryption] = useState("WPA");

  // QR Validation Scan Test State
  const [validationResult, setValidationResult] = useState(null); // null, 'success', 'failed'

  // Toast Notification State
  const [toasts, setToasts] = useState([]);

  // Local Analytics State
  const [analytics, setAnalytics] = useState(() => {
    try {
      const stats = JSON.parse(localStorage.getItem("qr_analytics_stats") || "[]");
      const savedCount = JSON.parse(localStorage.getItem("qr_saved_designs") || "[]").length;
      
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      const oneWeek = 7 * oneDay;
      
      const todayCount = stats.filter(t => now - t < oneDay).length;
      const weekCount = stats.filter(t => now - t < oneWeek).length;
      
      return {
        total: stats.length,
        today: todayCount,
        thisWeek: weekCount,
        savedCount: savedCount
      };
    } catch {
      return { total: 0, today: 0, thisWeek: 0, savedCount: 0 };
    }
  });

  // History & Presets Local Storage States
  const [historyItems, setHistoryItems] = useState(() => {
    const cached = localStorage.getItem("qr_history");
    return cached ? JSON.parse(cached) : [];
  });

  const [savedDesigns, setSavedDesigns] = useState(() => {
    const cached = localStorage.getItem("qr_saved_designs");
    return cached ? JSON.parse(cached) : [];
  });

  // Stable callbacks to avoid purity and render lifecycle check issues
  const showToast = useCallback((message, type = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  // Update local analytics state from storage stats
  const updateAnalytics = useCallback(() => {
    try {
      const stats = JSON.parse(localStorage.getItem("qr_analytics_stats") || "[]");
      const savedCount = JSON.parse(localStorage.getItem("qr_saved_designs") || "[]").length;
      
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      const oneWeek = 7 * oneDay;
      
      const todayCount = stats.filter(t => now - t < oneDay).length;
      const weekCount = stats.filter(t => now - t < oneWeek).length;
      
      setAnalytics({
        total: stats.length,
        today: todayCount,
        thisWeek: weekCount,
        savedCount: savedCount
      });
    } catch (e) {
      console.warn("Failed to load analytics stats:", e);
    }
  }, []);

  // Record a new QR generation in analytics stats
  const recordGeneration = useCallback(() => {
    try {
      const stats = JSON.parse(localStorage.getItem("qr_analytics_stats") || "[]");
      stats.push(Date.now());
      localStorage.setItem("qr_analytics_stats", JSON.stringify(stats));
      updateAnalytics();
    } catch (e) {
      console.warn("Failed to save generation analytics:", e);
    }
  }, [updateAnalytics]);

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
      data: generatedValue || "https://eliteqrgenerator.vercel.app",
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
    
    // Clear validation status when options change
    setValidationResult(null);
    setIsLoading(true);

    const timer = setTimeout(() => {
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
      setIsLoading(false);
    }, 150);

    return () => clearTimeout(timer);
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
  const saveToHistory = useCallback(() => {
    const newItem = {
      id: Math.random().toString(36).substring(2, 9) + "-" + Date.now(),
      type: qrState.qrType,
      data: generatedValue,
      wifiSsid: wifiSsid,
      timestamp: Date.now(),
      ...qrState
    };
    
    setHistoryItems(prev => {
      const updated = [newItem, ...prev.slice(0, 19)];
      localStorage.setItem("qr_history", JSON.stringify(updated));
      return updated;
    });
    recordGeneration();
  }, [generatedValue, qrState, wifiSsid, recordGeneration]);

  const handleReuseHistory = useCallback((item) => {
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
    showToast("Loaded design from history");
  }, [showToast]);

  const handleDeleteHistory = useCallback((id) => {
    setHistoryItems(prev => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem("qr_history", JSON.stringify(updated));
      return updated;
    });
    showToast("Deleted history record");
  }, [showToast]);

  // Apply QR templates presets
  const handleApplyTemplate = useCallback((template) => {
    setQrState(prev => ({
      ...prev,
      dotType: template.dotType,
      cornerSquareType: template.cornerSquareType,
      cornerDotType: template.cornerDotType,
      colorType: template.colorType,
      dotColor: template.dotColor,
      gradientType: template.gradientType || "linear",
      gradientColor: template.gradientColor || "#D7C4B1",
      gradientRotation: template.gradientRotation || 0,
      bgColor: template.bgColor,
      transparentBg: template.transparentBg,
    }));
    showToast(`Template "${template.name}" applied!`);
  }, [showToast]);

  // Saved Custom Presets Handlers
  const handleSaveDesign = useCallback((name) => {
    const newDesign = {
      id: Math.random().toString(36).substring(2, 9) + "-" + Date.now(),
      name,
      qrType: qrState.qrType,
      rawData: qrState.rawData,
      wifiSsid: wifiSsid,
      wifiPassword: wifiPassword,
      wifiEncryption: wifiEncryption,
      dotType: qrState.dotType,
      cornerSquareType: qrState.cornerSquareType,
      cornerDotType: qrState.cornerDotType,
      colorType: qrState.colorType,
      dotColor: qrState.dotColor,
      gradientType: qrState.gradientType,
      gradientColor: qrState.gradientColor,
      gradientRotation: qrState.gradientRotation,
      bgColor: qrState.transparentBg ? "transparent" : qrState.bgColor,
      transparentBg: qrState.transparentBg,
      margin: qrState.margin,
      logo: qrState.logo,
      logoSize: qrState.logoSize,
      logoMargin: qrState.logoMargin,
      timestamp: Date.now()
    };

    setSavedDesigns(prev => {
      const updated = [...prev, newDesign];
      localStorage.setItem("qr_saved_designs", JSON.stringify(updated));
      return updated;
    });
    setTimeout(() => {
      updateAnalytics();
    }, 50);
    showToast(`Saved design "${name}" successfully!`);
  }, [qrState, wifiSsid, wifiPassword, wifiEncryption, updateAnalytics, showToast]);

  const handleDeleteSaved = useCallback((id) => {
    setSavedDesigns(prev => {
      const updated = prev.filter(p => p.id !== id);
      localStorage.setItem("qr_saved_designs", JSON.stringify(updated));
      return updated;
    });
    setTimeout(() => {
      updateAnalytics();
    }, 50);
    showToast("Deleted saved design");
  }, [updateAnalytics, showToast]);

  const handleApplySaved = useCallback((item) => {
    setQrState({
      qrType: item.qrType,
      rawData: item.rawData || "",
      dotType: item.dotType,
      cornerSquareType: item.cornerSquareType,
      cornerDotType: item.cornerDotType,
      colorType: item.colorType || "single",
      dotColor: item.dotColor,
      gradientType: item.gradientType || "linear",
      gradientColor: item.gradientColor || "#D7C4B1",
      gradientRotation: item.gradientRotation || 0,
      bgColor: item.bgColor === "transparent" ? "#FFFFFF" : item.bgColor,
      transparentBg: item.transparentBg || item.bgColor === "transparent",
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
    showToast(`Loaded saved design "${item.name}"`);
  }, [showToast]);

  // Scannability test checker
  const handleTestQR = useCallback(() => {
    try {
      const canvas = qrRef.current.querySelector("canvas");
      if (!canvas) {
        setValidationResult("failed");
        showToast("QR Code Canvas not rendered yet", "error");
        return;
      }
      
      const ctx = canvas.getContext("2d");
      const width = canvas.width;
      const height = canvas.height;
      const imageData = ctx.getImageData(0, 0, width, height);
      
      const code = jsQR(imageData.data, width, height);
      if (code && code.data) {
        setValidationResult("success");
        showToast("Validation Passed! QR is fully scannable.");
      } else {
        setValidationResult("failed");
        showToast("Validation Failed. QR might not be scannable.", "error");
      }
    } catch (err) {
      console.error("Test QR error:", err);
      setValidationResult("failed");
      showToast("Error checking scannability.", "error");
    }
  }, [showToast]);

  // Logo Upload handlers
  const handleLogoUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setQrState(prev => ({ ...prev, logo: reader.result }));
      showToast("Logo uploaded successfully");
    };
    reader.readAsDataURL(file);
  }, [showToast]);

  const handleRemoveLogo = useCallback(() => {
    setQrState(prev => ({ ...prev, logo: "" }));
    showToast("Logo removed");
  }, [showToast]);

  // Export handlers
  const handleDownload = useCallback(async (format) => {
    if (!generatedValue) return;
    
    saveToHistory();

    const exportQr = new QRCodeStyling({
      width: selectedResolution,
      height: selectedResolution,
      data: generatedValue,
      margin: qrState.margin * (selectedResolution / 300),
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
      name: `elite-qr-${selectedResolution}px`,
      extension: format
    });
    showToast(`Downloaded ${format.toUpperCase()} successfully!`);
  }, [generatedValue, selectedResolution, qrState, saveToHistory, showToast]);

  const handleDownloadAll = useCallback(async () => {
    await handleDownload("png");
    setTimeout(() => handleDownload("jpeg"), 350);
    setTimeout(() => handleDownload("svg"), 700);
    showToast("Triggered download for all 3 formats!");
  }, [handleDownload, showToast]);

  const handleCopyImage = useCallback(async () => {
    try {
      const canvas = qrRef.current.querySelector("canvas");
      if (!canvas) return;
      
      saveToHistory();
      
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob })
        ]);
        showToast("Success! QR Code image copied to clipboard.");
      }, "image/png");
    } catch (err) {
      console.warn("Clipboard writing error:", err);
      showToast("Clipboard copy failed. Please download the QR directly.", "error");
    }
  }, [saveToHistory, showToast]);

  const handleCopyLink = useCallback(() => {
    try {
      navigator.clipboard.writeText(generatedValue);
      saveToHistory();
      showToast("Copied encoded content to clipboard!");
    } catch (err) {
      console.error(err);
      showToast("Copy failed", "error");
    }
  }, [generatedValue, saveToHistory, showToast]);

  const handleShare = useCallback(async () => {
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
          showToast("Shared successfully!");
        } else {
          // Fallback
          navigator.clipboard.writeText(generatedValue);
          showToast("Sharing not supported. Content copied to clipboard instead!");
        }
      });
    } catch (err) {
      console.warn(err);
      showToast("Sharing aborted or failed", "error");
    }
  }, [generatedValue, saveToHistory, showToast]);

  return (
    <section id="generator" className="generator-section">
      <div className="container">
        
        {/* Local Analytics Dashboard Row */}
        <div className="analytics-dashboard">
          <div className="analytics-card">
            <div className="analytics-value">{analytics.total}</div>
            <div className="analytics-label">Total Generated</div>
          </div>
          <div className="analytics-card">
            <div className="analytics-value">{analytics.today}</div>
            <div className="analytics-label">Today</div>
          </div>
          <div className="analytics-card">
            <div className="analytics-value">{analytics.thisWeek}</div>
            <div className="analytics-label">This Week</div>
          </div>
          <div className="analytics-card">
            <div className="analytics-value">{analytics.savedCount}</div>
            <div className="analytics-label">Saved Designs</div>
          </div>
        </div>

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

                {/* Phase 5: One-click Design Templates */}
                <div className="input-group">
                  <label className="input-label">✨ One-Click Theme Templates</label>
                  <div className="templates-grid">
                    {QR_TEMPLATES.map(template => (
                      <div
                        key={template.id}
                        className={`template-btn ${qrState.dotType === template.dotType && qrState.dotColor === template.dotColor ? "active" : ""}`}
                        onClick={() => handleApplyTemplate(template)}
                      >
                        <div
                          className="template-btn-preview"
                          style={{
                            background: template.colorType === "gradient" 
                              ? `linear-gradient(${template.gradientRotation || 0}deg, ${template.dotColor}, ${template.gradientColor})`
                              : template.dotColor,
                            borderColor: template.bgColor === "#FFFFFF" ? "rgba(0,0,0,0.1)" : template.bgColor
                          }}
                        />
                        <span className="template-btn-title">{template.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

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
                <h3 className="panel-title"><FiBookmark /> Presets & Saved Designs</h3>

                {/* Phase 6: Save Current Design Preset */}
                <div style={{ marginBottom: "25px" }}>
                  <label className="input-label">⭐ Save Current Design Template</label>
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const name = e.target.elements.designName.value.trim();
                      if (!name) return;
                      handleSaveDesign(name);
                      e.target.reset();
                    }}
                    style={{ display: "flex", gap: "10px", marginTop: "8px" }}
                  >
                    <input
                      type="text"
                      name="designName"
                      className="input-field"
                      placeholder="e.g. My Style v1"
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
                        borderRadius: "var(--radius-sm)"
                      }}
                    >
                      Save
                    </button>
                  </form>
                </div>

                {/* Saved Designs preseters */}
                {savedDesigns.length > 0 && (
                  <div style={{ marginBottom: "25px" }}>
                    <label className="input-label">⭐ Your Saved Designs</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
                      {savedDesigns.map((design) => (
                        <div
                          key={design.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "10px 12px",
                            borderRadius: "var(--radius-sm)",
                            background: "rgba(0, 0, 0, 0.02)",
                            border: "1px solid var(--border-color)"
                          }}
                        >
                          <button
                            onClick={() => handleApplySaved(design)}
                            style={{
                              background: "none",
                              border: "none",
                              fontFamily: "inherit",
                              fontSize: "0.85rem",
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
                                width: "10px",
                                height: "10px",
                                borderRadius: "50%",
                                background: design.dotColor || "var(--primary)"
                              }}
                            />
                            {design.name}
                            <span style={{ fontSize: "0.7rem", opacity: 0.5, fontWeight: 500 }}>
                              ({new Date(design.timestamp).toLocaleDateString()})
                            </span>
                          </button>

                          <button
                            onClick={() => handleDeleteSaved(design.id)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--accent)",
                              cursor: "pointer",
                              padding: "4px"
                            }}
                            title="Delete Saved Preset"
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
                {/* QR Canvas Container with loader state */}
                <div style={{ position: "relative" }}>
                  <div
                    className={`qr-canvas-wrapper ${qrState.transparentBg ? "transparent-bg" : ""}`}
                    ref={qrRef}
                    style={{ opacity: isLoading ? 0.3 : 1 }}
                  />
                  
                  {isLoading && (
                    <div 
                      className="skeleton-box" 
                      style={{ 
                        position: "absolute", 
                        top: 0, 
                        left: 0, 
                        width: "100%", 
                        height: "100%",
                        opacity: 0.4
                      }} 
                    />
                  )}
                </div>

                {/* Phase 7: Scannability Test Buttons */}
                <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", marginTop: "15px" }}>
                  <Button variant="outline" onClick={handleTestQR} style={{ width: "100%", fontSize: "0.85rem", padding: "8px 16px" }}>
                    🔍 Test QR Validity
                  </Button>
                  
                  {validationResult === "success" && (
                    <div className="validation-banner validation-success">
                      <FiCheckCircle size={16} />
                      <span>✅ QR is scannable</span>
                    </div>
                  )}

                  {validationResult === "failed" && (
                    <div className="validation-banner validation-failed">
                      <FiXCircle size={16} />
                      <span>❌ QR validation failed</span>
                    </div>
                  )}
                </div>

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
                  <button className="share-icon-btn" onClick={handleCopyImage} title="📋 Copy QR Image to Clipboard">
                    <FiCopy />
                    <span>📋 Copy QR</span>
                  </button>

                  <button className="share-icon-btn" onClick={handleShare} title="📤 Share QR via System Application">
                    <FiShare2 />
                    <span>📤 Share QR</span>
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

      {/* Frame Motion Toast Notifications renderer */}
      <div className="toast-container">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className={`toast ${t.type === "error" ? "toast-error" : ""}`}
            >
              {t.type === "error" ? <FiXCircle style={{ color: "var(--accent)" }} /> : <FiCheckCircle style={{ color: "var(--primary)" }} />}
              <span>{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </section>
  );
}
