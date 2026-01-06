import React from "react";
import { cn } from "../../lib/utils";

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
}

interface TabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  disabled?: boolean;
}

export function Tabs<T extends string = string>({
  tabs,
  activeTab,
  onTabChange,
  disabled = false,
}: TabsProps<T>) {
  return (
    <div className="flex flex-wrap gap-2 w-full overflow-x-auto pb-2 no-scrollbar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          disabled={disabled}
          className={cn(
            "px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap",
            activeTab === tab.id
              ? "bg-primary text-white shadow-md shadow-primary/20"
              : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-primary",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

