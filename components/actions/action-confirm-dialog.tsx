"use client";

import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import type { AIAction } from "@/lib/actions/types";

type ActionConfirmDialogProps = {
  action: AIAction;
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ActionConfirmDialog({ action, open, onCancel, onConfirm }: ActionConfirmDialogProps) {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    confirmButtonRef.current?.focus();
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[#4a3329]/32 p-6 backdrop-blur-[3px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <section
        aria-describedby="action-confirm-description"
        aria-labelledby="action-confirm-title"
        aria-modal="true"
        className="w-full max-w-md rounded-[1.5rem] border border-[#dfc8b4] bg-[#fffaf3] p-6 shadow-[0_24px_70px_rgb(74_51_41_/_0.22)]"
        role="dialog"
      >
        <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-[#713b2b]" id="action-confirm-title">Confirm Action</h2>
        <div className="mt-5 rounded-xl border border-[#e4d1c0] bg-[#fffaf4] p-4">
          <p className="font-semibold">{action.title}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground" id="action-confirm-description">{action.description}</p>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button onClick={onCancel} type="button" variant="outline">Cancel</Button>
          <Button onClick={onConfirm} ref={confirmButtonRef} type="button">Confirm</Button>
        </div>
      </section>
    </div>
  );
}
