"use client";

import { useRef } from "react";
import { RemindyApp } from "../components/RemindyApp";

export default function Home() {
  const dashboardRef = useRef<HTMLDivElement>(null);

  const scrollToDashboard = () => {
    dashboardRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main>
      <div ref={dashboardRef}>
        <RemindyApp />
      </div>
    </main>
  );
}

