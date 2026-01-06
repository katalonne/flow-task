import React from "react";
import { cn } from "../../lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined";
  padding?: "sm" | "md" | "lg";
}

const paddingMap = {
  sm: "p-3 sm:p-4",
  md: "p-4 sm:p-6",
  lg: "p-6 sm:p-8",
};

const variantMap = {
  default: "bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-border/40",
  elevated: "bg-white rounded-2xl shadow-2xl border border-border/20",
  outlined: "bg-white rounded-2xl border-2 border-border/60",
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", padding = "md", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(variantMap[variant], paddingMap[padding], className)}
      {...props}
    />
  )
);

Card.displayName = "Card";

