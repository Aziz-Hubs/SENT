import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  gradientColor?: string;
  glowOpacity?: number;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      className,
      children,
      gradientColor = "cyan",
      glowOpacity = 0.1,
      ...props
    },
    ref,
  ) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "glass-card rounded-xl p-6 relative overflow-hidden group transition-colors duration-500",
          className,
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{
          scale: 1.01,
          boxShadow: `0 0 40px -10px rgba(var(--neon-${gradientColor}-rgb), ${glowOpacity + 0.2})`,
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        {...props}
      >
        <div
          className={cn(
            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none",
            `bg-gradient-to-tr from-${gradientColor}-500/10 to-transparent`,
          )}
        />
        <div className="relative z-10">{children as React.ReactNode}</div>
      </motion.div>
    );
  },
);

GlassCard.displayName = "GlassCard";
