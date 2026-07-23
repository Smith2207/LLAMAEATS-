"use client";

import { useEffect, useRef } from "react";
import { gsap, SplitText as GsapSplitText } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function SplitTextReveal({
  as: Tag = "h1",
  className,
  children,
  delay = 0,
}: {
  as?: "h1" | "h2" | "p";
  className?: string;
  children: string;
  delay?: number;
}) {
  const ref = useRef<HTMLHeadingElement | HTMLParagraphElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!ref.current || reducedMotion) return;

    const split = new GsapSplitText(ref.current, { type: "words", wordsClass: "inline-block" });
    gsap.set(split.words, { yPercent: 120, opacity: 0 });
    const tween = gsap.to(split.words, {
      yPercent: 0,
      opacity: 1,
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.06,
      delay,
    });

    return () => {
      tween.kill();
      split.revert();
    };
  }, [reducedMotion, delay]);

  return (
    <Tag ref={ref as never} className={className} style={{ overflow: "hidden" }}>
      {children}
    </Tag>
  );
}
