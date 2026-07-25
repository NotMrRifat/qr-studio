import { 
  FiGlobe, 
  FiAlignLeft, 
  FiPhone, 
  FiMail, 
  FiMessageSquare, 
  FiWifi 
} from "react-icons/fi";
import { 
  FaWhatsapp, 
  FaTelegramPlane, 
  FaFacebookF, 
  FaInstagram 
} from "react-icons/fa";

export const qrTypes = [
  {
    id: "url",
    name: "Website URL",
    icon: FiGlobe,
    placeholder: "https://example.com"
  },
  {
    id: "text",
    name: "Text Message",
    icon: FiAlignLeft,
    placeholder: "Type your text here..."
  },
  {
    id: "phone",
    name: "Phone Number",
    icon: FiPhone,
    placeholder: "e.g. +1234567890"
  },
  {
    id: "email",
    name: "Email Address",
    icon: FiMail,
    placeholder: "hello@example.com"
  },
  {
    id: "whatsapp",
    name: "WhatsApp Chat",
    icon: FaWhatsapp,
    placeholder: "e.g. 01712345678"
  },
  {
    id: "sms",
    name: "SMS Message",
    icon: FiMessageSquare,
    placeholder: "e.g. +1234567890"
  },
  {
    id: "telegram",
    name: "Telegram Username",
    icon: FaTelegramPlane,
    placeholder: "username"
  },
  {
    id: "facebook",
    name: "Facebook Profile",
    icon: FaFacebookF,
    placeholder: "username"
  },
  {
    id: "instagram",
    name: "Instagram Profile",
    icon: FaInstagram,
    placeholder: "username"
  },
  {
    id: "wifi",
    name: "WiFi Network",
    icon: FiWifi,
    placeholder: "WiFi Setup"
  }
];