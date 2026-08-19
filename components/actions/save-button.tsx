"use client";

import { useState } from "react";
import { Bookmark, Check, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { saveItem } from "@/lib/supabase/savedItems";

export function SaveButton({ inboxItemId, initialSavedItemId, label = "Save", showDescription = false }: { inboxItemId: string; initialSavedItemId?: string; label?: string; showDescription?: boolean }) {
  const [savedItemId, setSavedItemId] = useState(initialSavedItemId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const buttonLabel = saving ? "Saving..." : savedItemId ? "Saved" : error ? "Retry" : label.trim() || "Save";

  async function handleSave() {
    if (savedItemId || saving) return;
    setSaving(true);
    setError(null);
    try {
      const savedItem = await saveItem(inboxItemId);
      setSavedItemId(savedItem.id);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Item could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative">
      <Button className={showDescription ? "h-auto min-h-20 w-full min-w-0 justify-start whitespace-normal px-4 py-3 text-left" : "h-11 min-w-36"} disabled={Boolean(savedItemId) || saving} onClick={handleSave} variant="outline" type="button">
        {saving ? <LoaderCircle className="size-4.5 animate-spin" /> : savedItemId ? <Check className="size-4.5" /> : <Bookmark className="size-4.5" />}
        {showDescription ? (
          <span><span className="block">{buttonLabel}</span><span className="mt-1 block text-xs font-normal text-muted-foreground">{label === "Save Place" ? "Keep this place for later" : "Keep this information for later"}</span></span>
        ) : buttonLabel}
      </Button>
      {error ? <span className="absolute right-0 top-full mt-1 w-56 text-right text-xs text-red-600" role="alert">{error}</span> : null}
    </div>
  );
}
