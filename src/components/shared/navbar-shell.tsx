"use client";

import { motion, useScroll, useTransform } from "framer-motion";

export function NavbarShell({ children }: { children: React.ReactNode }) {
  const { scrollY } = useScroll();
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 1]);
  const shadowOpacity = useTransform(scrollY, [0, 80], [0, 0.12]);
  const boxShadow = useTransform(
    shadowOpacity,
    (o) => `0 8px 24px -12px rgba(7, 26, 44, ${o})`,
  );
  const borderColor = useTransform(
    borderOpacity,
    (o) => `rgba(27, 73, 101, ${o * 0.35})`,
  );

  return (
    <motion.header
      style={{ boxShadow, borderColor }}
      className="glass sticky top-0 z-40 border-b"
    >
      {children}
    </motion.header>
  );
}
