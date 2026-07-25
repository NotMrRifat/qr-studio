import { motion } from "framer-motion";

export default function Button({ 
  children, 
  onClick, 
  type = "button", 
  variant = "primary", 
  className = "", 
  disabled = false,
  icon: Icon
}) {
  let buttonClass = "";
  if (variant === "primary") buttonClass = "cta-btn";
  else if (variant === "secondary") buttonClass = "action-btn btn-primary";
  else if (variant === "outline") buttonClass = "action-btn btn-outline";
  else if (variant === "icon") buttonClass = "icon-btn";

  return (
    <motion.button
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ y: 0, scale: 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${buttonClass} ${className}`}
      style={{ opacity: disabled ? 0.6 : 1 }}
    >
      {Icon && <Icon className="btn-icon" />}
      {children}
    </motion.button>
  );
}
