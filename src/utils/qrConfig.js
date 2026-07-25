export const DOT_SHAPES = [
  { id: "rounded", name: "Rounded" },
  { id: "square", name: "Square" },
  { id: "extra-rounded", name: "Extra Rounded" },
  { id: "classy", name: "Classy" },
  { id: "classy-rounded", name: "Classy Rounded" }
];

export const CORNER_SQUARE_STYLES = [
  { id: "square", name: "Square" },
  { id: "dot", name: "Dot" },
  { id: "extra-rounded", name: "Extra Rounded" }
];

export const CORNER_DOT_STYLES = [
  { id: "square", name: "Square" },
  { id: "dot", name: "Dot" }
];

export const RESOLUTIONS = [
  { label: "Standard (512px)", value: 512 },
  { label: "High Res (1024px)", value: 1024 },
  { label: "Ultra Res (2048px)", value: 2048 }
];

export const DEFAULT_PRESETS = [
  {
    id: "stymetics-classic",
    name: "StyMetics Classic",
    dotColor: "#630D16",
    bgColor: "#FFFFFF",
    dotType: "classy-rounded",
    cornerSquareType: "extra-rounded",
    cornerDotType: "dot",
    gradientType: "none",
    margin: 10
  },
  {
    id: "luxury-gold",
    name: "Luxury Gold",
    dotColor: "#8B1E2D",
    bgColor: "#EDE4DA",
    dotType: "rounded",
    cornerSquareType: "extra-rounded",
    cornerDotType: "dot",
    gradientType: "linear",
    gradientColor: "#630D16",
    margin: 12
  },
  {
    id: "minimal-dark",
    name: "Minimal Dark",
    dotColor: "#1A0D0F",
    bgColor: "#FFFFFF",
    dotType: "square",
    cornerSquareType: "square",
    cornerDotType: "square",
    gradientType: "none",
    margin: 8
  },
  {
    id: "sunset-gradient",
    name: "Sunset Gradient",
    dotColor: "#8B1E2D",
    bgColor: "#FFFFFF",
    dotType: "extra-rounded",
    cornerSquareType: "extra-rounded",
    cornerDotType: "dot",
    gradientType: "linear",
    gradientColor: "#D7C4B1",
    margin: 10
  }
];

export const DEFAULT_QR_STATE = {
  qrType: "url",
  rawData: "https://stymetics.com",
  wifiSsid: "",
  wifiPassword: "",
  wifiEncryption: "WPA",
  
  dotType: "rounded",
  cornerSquareType: "extra-rounded",
  cornerDotType: "dot",
  
  colorType: "single", // "single" or "gradient"
  dotColor: "#630D16",
  gradientType: "linear", // "linear" or "radial"
  gradientColor: "#D7C4B1",
  gradientRotation: 0,
  
  bgColor: "#FFFFFF",
  transparentBg: false,
  margin: 10,
  
  logo: "",
  logoSize: 0.3,
  logoMargin: 5
};
