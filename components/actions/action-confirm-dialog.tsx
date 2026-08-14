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
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 p-6 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <section
        aria-describedby="action-confirm-description"
        aria-labelledby="action-confirm-title"
        aria-modal="true"
        className="w-full max-w-md rounded-xl border bg-white p-6 shadow-2xl"
        role="dialog"
      >
        <h2 className="text-xl font-semibold tracking-[-0.02em]" id="action-confirm-title">Confirm Action</h2>
        <div className="mt-5 rounded-lg border bg-slate-50/70 p-4">
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
