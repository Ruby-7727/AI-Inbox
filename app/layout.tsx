import type { Metadata } from "next";

import { AppShell } from "@/components/layout/app-shell";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AI Inbox",
    template: "%s · AI Inbox",
  },
  description: "Turn screenshots into useful, structured actions.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
