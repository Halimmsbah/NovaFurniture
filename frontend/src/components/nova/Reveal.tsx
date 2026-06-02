import { motion, type Variants } from "framer-motion";
import { type ReactNode } from "react";
import { useReducedMotionPref } from "@/lib/motion";

const variants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.7, ease: [0.22, 1, 0.36, 1] as any },
  }),
};

export function Reveal({ children, i = 0, className }: { children: ReactNode; i?: number; className?: string }) {
  const reduced = useReducedMotionPref();
  if (reduced) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div variants={variants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} custom={i} className={className}>
      {children}
    </motion.div>
  );
}
