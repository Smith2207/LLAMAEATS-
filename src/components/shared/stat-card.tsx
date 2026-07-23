"use client";

import { motion } from "framer-motion";

export function StatCard({
  label,
  value,
  index = 0,
}: {
  label: string;
  value: string;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
      className="rounded-xl border border-border/60 bg-card p-4 transition-colors hover:border-primary/40"
    >
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-foreground">{value}</p>
    </motion.div>
  );
}
