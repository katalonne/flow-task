import type { Metadata } from "next";
import { Montserrat, Fira_Code } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "../lib/query-client";

const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const firaCode = Fira_Code({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Remindy - AI-Powered Phone Reminders",
  description: "Schedule reminders with ease. Never miss an important moment with AI-powered voice call reminders.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} ${firaCode.variable} font-sans min-h-screen antialiased bg-background text-foreground`}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}

