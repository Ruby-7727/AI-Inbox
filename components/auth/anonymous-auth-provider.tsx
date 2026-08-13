"use client";

import { useEffect } from "react";

import { ensureAnonymousUser } from "@/lib/supabase/auth";

export function AnonymousAuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  useEffect(() => {
    void ensureAnonymousUser().catch((error) => {
      console.error("Anonymous authentication failed", error instanceof Error ? error.message : "Unknown error");
    });
  }, []);

  return children;
}
