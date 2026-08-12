"use client";

import { createContext, useContext, useState } from "react";

import { UploadModal } from "@/components/actions/upload-modal";

type UploadContextValue = {
  openUpload: () => void;
};

const UploadContext = createContext<UploadContextValue | null>(null);

export function UploadProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [open, setOpen] = useState(false);

  return (
    <UploadContext.Provider value={{ openUpload: () => setOpen(true) }}>
      {children}
      <UploadModal open={open} onOpenChange={setOpen} />
    </UploadContext.Provider>
  );
}

export function useUpload() {
  const context = useContext(UploadContext);
  if (!context) throw new Error("useUpload must be used within UploadProvider");
  return context;
}
