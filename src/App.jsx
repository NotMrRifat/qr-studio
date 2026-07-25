import { useEffect, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";

export default function App() {
  const qrRef = useRef(null);
  const qrInstance = useRef(null);

  const [text, setText] = useState("https://stymetics.com");

  useEffect(() => {
    qrInstance.current = new QRCodeStyling({
      width: 300,
      height: 300,
      data: text,
      margin: 10,
      dotsOptions: {
        color: "#000000",
        type: "rounded",
      },
      backgroundOptions: {
        color: "#ffffff",
      },
    });

    qrInstance.current.append(qrRef.current);

    return () => {
      if (qrRef.current) {
        qrRef.current.innerHTML = "";
      }
    };
  }, []);

  useEffect(() => {
    qrInstance.current?.update({
      data: text,
    });
  }, [text]);

  const downloadPNG = () => {
    qrInstance.current.download({
      name: "qr-code",
      extension: "png",
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f5f5",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "30px",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "500px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        }}
      >
        <h1>QR Studio</h1>

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter URL or Text"
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "20px",
          }}
        />

        <div
          ref={qrRef}
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        />

        <button
          onClick={downloadPNG}
          style={{
            width: "100%",
            padding: "12px",
            cursor: "pointer",
          }}
        >
          Download PNG
        </button>
      </div>
    </div>
  );
}