"use client";

import { useState } from "react";
import { Bookmark, Check, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { saveItem } from "@/lib/supabase/savedItems";

export function SaveButton({ inboxItemId, initialSavedItemId }: { inboxItemId: string; initialSavedItemId?: string }) {
  const [savedItemId, setSavedItemId] = useState(initialSavedItemId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      <Button className="h-11 min-w-36" disabled={Boolean(savedItemId) || saving} onClick={handleSave} variant="outline" type="button">
        {saving ? <LoaderCircle className="size-4.5 animate-spin" /> : savedItemId ? <Check className="size-4.5" /> : <Bookmark className="size-4.5" />}
        {saving ? "Saving..." : savedItemId ? "Saved" : "Save"}
      </Button>
      {error ? <span className="absolute right-0 top-full mt-1 w-56 text-right text-xs text-red-600" role="alert">{error}</span> : null}
    </div>
  );
}
