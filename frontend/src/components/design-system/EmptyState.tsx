import React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "../ui/Button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: "default" | "error";
}

const variantConfig = {
  default: {
    bgColor: "bg-secondary/30",
    borderColor: "border-border/60",
    iconBg: "bg-muted/50",
    iconColor: "text-muted-foreground/50",
    titleColor: "text-primary",
  },
  error: {
    bgColor: "bg-red-50/50",
    borderColor: "border-red-200",
    iconBg: "bg-red-100",
    iconColor: "text-red-500",
    titleColor: "text-gray-900",
  },
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = "default",
}: EmptyStateProps) {
  const config = variantConfig[variant];

  return (
    <div
      className={`flex flex-col items-center justify-center h-64 ${config.bgColor} rounded-2xl border border-dashed ${config.borderColor} animate-in fade-in duration-500`}
    >
      <div
        className={`w-16 h-16 ${config.iconBg} rounded-full flex items-center justify-center mb-4`}
      >
        <Icon className={`w-8 h-8 ${config.iconColor}`} />
      </div>
      <h3 className={`text-lg font-bold ${config.titleColor}`}>{title}</h3>
      <p className="text-muted-foreground mt-1 max-w-sm text-center mx-auto px-4">
        {description}
      </p>
      {action && (
        <Button
          variant="link"
          onClick={action.onClick}
          className="mt-4 text-accent"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

