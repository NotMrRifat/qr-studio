import { motion } from "framer-motion";

export default function Card({ 
  children, 
  className = "", 
  hoverable = true,
  delay = 0 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hoverable ? { y: -5, boxShadow: "var(--shadow-hover)" } : {}}
      className={`glass ${className}`}
      style={{ padding: '30px' }}
    >
      {children}
    </motion.div>
  );
}
