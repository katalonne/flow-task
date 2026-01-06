import React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "../ui/Button";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-64 bg-red-50 rounded-2xl border border-red-100 animate-in zoom-in-95 duration-300">
      <AlertCircle className="w-10 h-10 text-destructive mb-3" />
      <h3 className="text-lg font-bold text-destructive">Failed to load</h3>
      <p className="text-destructive/80 mb-4">{message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="border-red-200 hover:bg-red-100 text-destructive"
        >
          Try Again
        </Button>
      )}
    </div>
  );
}

