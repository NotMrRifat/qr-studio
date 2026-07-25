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

export const QR_TEMPLATES = [
  {
    id: "minimal",
    name: "Minimal",
    dotColor: "#000000",
    bgColor: "#FFFFFF",
    dotType: "square",
    cornerSquareType: "square",
    cornerDotType: "square",
    colorType: "single",
    transparentBg: false
  },
  {
    id: "luxury",
    name: "Luxury",
    dotColor: "#630D16",
    bgColor: "#D7C4B1",
    dotType: "classy",
    cornerSquareType: "extra-rounded",
    cornerDotType: "dot",
    colorType: "single",
    transparentBg: false
  },
  {
    id: "dark",
    name: "Dark",
    dotColor: "#D7C4B1",
    bgColor: "#1A0D0F",
    dotType: "rounded",
    cornerSquareType: "extra-rounded",
    cornerDotType: "dot",
    colorType: "single",
    transparentBg: false
  },
  {
    id: "neon",
    name: "Neon",
    dotColor: "#00F2FE",
    bgColor: "#000000",
    dotType: "extra-rounded",
    cornerSquareType: "extra-rounded",
    cornerDotType: "dot",
    colorType: "gradient",
    gradientType: "linear",
    gradientColor: "#4FACFE",
    gradientRotation: 45,
    transparentBg: false
  },
  {
    id: "stymetics",
    name: "StyMetics",
    dotColor: "#630D16",
    bgColor: "#EDE4DA",
    dotType: "classy-rounded",
    cornerSquareType: "extra-rounded",
    cornerDotType: "dot",
    colorType: "gradient",
    gradientType: "linear",
    gradientColor: "#8B1E2D",
    gradientRotation: 135,
    transparentBg: false
  },
  {
    id: "business",
    name: "Business",
    dotColor: "#0A192F",
    bgColor: "#FFFFFF",
    dotType: "square",
    cornerSquareType: "square",
    cornerDotType: "square",
    colorType: "single",
    transparentBg: false
  }
];

