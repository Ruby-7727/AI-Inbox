"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, LoaderCircle, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { deleteInboxItem } from "@/lib/supabase/inboxItems";

export function DeleteItemButton({ itemId }: { itemId: string }) {
  const router = useRouter();
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!confirmOpen) return;
    deleteButtonRef.current?.focus();
    function closeWithEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !deleting) setConfirmOpen(false);
    }
    window.addEventListener("keydown", closeWithEscape);
    return () => window.removeEventListener("keydown", closeWithEscape);
  }, [confirmOpen, deleting]);

  async function confirmDelete() {
    if (deleting || deleted) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteInboxItem(itemId);
      const cachedAnalysis = window.sessionStorage.getItem("ai-inbox:analysis");
      if (cachedAnalysis) {
        try {
          if ((JSON.parse(cachedAnalysis) as { id?: string }).id === itemId) window.sessionStorage.removeItem("ai-inbox:analysis");
        } catch {
          window.sessionStorage.removeItem("ai-inbox:analysis");
        }
      }
      setDeleted(true);
      window.setTimeout(() => {
        router.replace("/inbox");
        router.refresh();
      }, 650);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Item could not be deleted.");
      setDeleting(false);
    }
  }

  return (
    <>
      <Button
        className="border-[#dfbfb3] bg-[#fffaf4]/90 text-[#9f4d3a] shadow-[0_3px_10px_rgb(104_68_45_/_0.04)] hover:border-[#ce9f90] hover:bg-[#faebe5] hover:text-[#8d3f2e]"
        onClick={() => { setConfirmOpen(true); setError(null); }}
        type="button"
        variant="outline"
      >
        <Trash2 className="size-4.5" />
        Delete item
      </Button>

      {confirmOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#4a3329]/32 p-6 backdrop-blur-[3px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleting) setConfirmOpen(false);
          }}
        >
          <section aria-describedby="delete-item-description" aria-labelledby="delete-item-title" aria-modal="true" className="w-full max-w-md rounded-[1.5rem] border border-[#dfc8b4] bg-[#fffaf3] p-6 shadow-[0_24px_70px_rgb(74_51_41_/_0.22)]" role="dialog">
            {deleted ? (
              <div className="py-5 text-center" role="status"><CheckCircle2 className="mx-auto size-11 text-[#678259]" /><h2 className="mt-4 font-display text-2xl font-semibold text-[#633d30]">Item deleted</h2></div>
            ) : (
              <>
                <span className="grid size-11 place-items-center rounded-full bg-[#fae8e1] text-[#a64f3b]"><Trash2 className="size-5" /></span>
                <h2 className="mt-5 font-display text-2xl font-semibold tracking-[-0.02em] text-[#713b2b]" id="delete-item-title">Delete this item?</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground" id="delete-item-description">This will remove this screenshot and its saved information from AI Inbox.</p>
                {error ? <p className="mt-4 rounded-xl border border-[#e7b9ad] bg-[#fff3ef] px-4 py-3 text-sm text-[#9c4635]" role="alert">{error}</p> : null}
                <div className="mt-7 flex justify-end gap-3">
                  <Button disabled={deleting} onClick={() => setConfirmOpen(false)} type="button" variant="outline">Cancel</Button>
                  <Button className="bg-[#a64f3b] text-white hover:bg-[#8f402f]" disabled={deleting} onClick={confirmDelete} ref={deleteButtonRef} type="button">
                    {deleting ? <LoaderCircle className="size-4.5 animate-spin" /> : <Trash2 className="size-4.5" />}
                    {deleting ? "Deleting..." : error ? "Retry" : "Delete"}
                  </Button>
                </div>
              </>
            )}
          </section>
        </div>
      ) : null}
    </>
  );
}
