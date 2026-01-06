import React from "react";
import { Button } from "./ui/Button";
import { Mic } from "lucide-react";

interface HeroProps {
  onGetStarted: () => void;
}

export function Hero({ onGetStarted }: HeroProps) {
  return (
    <div className="relative w-full bg-primary overflow-hidden">
      {/* Abstract sound wave background pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg
          className="h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path
            d="M0 50 Q 25 20 50 50 T 100 50 V 100 H 0 Z"
            fill="white"
            fillOpacity="0.5"
          />
          <path
            d="M0 60 Q 30 30 60 60 T 120 60 V 100 H 0 Z"
            fill="white"
            fillOpacity="0.3"
          />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 flex flex-col items-center text-center">
        <div className="mb-6 sm:mb-8 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-accent/20 backdrop-blur-sm shadow-lg ring-1 ring-white/20">
          <Mic className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
        </div>
        
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight text-white mb-4 sm:mb-6">
          Introducing Remindy
        </h1>
        
        <p className="mt-2 sm:mt-4 text-base sm:text-xl text-primary-foreground/80 max-w-2xl px-4">
          Never miss an important moment again. The AI-powered voice reminder service that calls you when it matters most.
        </p>
        
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center w-full px-4 sm:px-0">
          <Button 
            variant="accent" 
            size="lg" 
            onClick={onGetStarted}
            className="shadow-xl shadow-accent/20 w-full sm:w-auto min-w-[200px]"
          >
            Get Started
          </Button>
        </div>
      </div>
      
      {/* Curve transition to white dashboard */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent opacity-20"></div>
    </div>
  );
}