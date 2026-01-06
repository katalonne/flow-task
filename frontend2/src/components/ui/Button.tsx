import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "accent" | "link";
  size?: "sm" | "md" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center cursor-pointer justify-center rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-primary text-white hover:bg-primary/90 shadow-md": variant === "primary",
            "bg-secondary text-primary hover:bg-secondary/80": variant === "secondary",
            "border border-primary text-primary hover:bg-primary/5": variant === "outline",
            "hover:bg-accent/10 text-primary": variant === "ghost",
            "bg-accent text-primary font-bold hover:bg-accent/90 shadow-md": variant === "accent",
            "text-primary underline hover:no-underline": variant === "link",
            "h-8 px-3 text-xs": size === "sm",
            "h-10 px-5 py-2": size === "md",
            "h-12 px-8 text-lg": size === "lg",
            "h-10 w-10 p-0": size === "icon",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };