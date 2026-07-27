"use client";

import { motion } from "framer-motion";

export function RevealItem({
  children,
  index = 0,
  className,
}: {
  children: React.ReactNode;
  index?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.35, delay: Math.min(index, 8) * 0.06, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
