import { ensureAnonymousUser } from "@/lib/supabase/auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { InboxItemRow, InboxItemStatus, InboxItemUpdate, StructuredInboxData } from "@/types/database";
import type { ScreenshotAnalysis } from "@/types/analysis";

const SCREENSHOTS_BUCKET = "screenshots";

export async function createInboxItem(file: File, analysis: ScreenshotAnalysis) {
  const supabase = getSupabaseBrowserClient();
  const user = await ensureAnonymousUser();
  const id = crypto.randomUUID();
  const imagePath = `${user.id}/${id}.${extensionFor(file.type)}`;
  const { error: uploadError } = await supabase.storage.from(SCREENSHOTS_BUCKET).upload(imagePath, file, {
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) throw new Error(`Screenshot storage failed: ${uploadError.message}`);

  const structuredData: StructuredInboxData = { fields: analysis.fields, actions: analysis.actions };
  const { data, error } = await supabase.from("inbox_items").insert({
    id,
    user_id: user.id,
    image_path: imagePath,
    intent: analysis.intent,
    title: analysis.title?.trim() || "Untitled screenshot",
    summary: analysis.summary,
    confidence: analysis.confidence,
    structured_data: structuredData,
    status: "new",
  }).select().single();

  if (error) {
    await supabase.storage.from(SCREENSHOTS_BUCKET).remove([imagePath]);
    throw new Error(`Saving analysis failed: ${error.message}`);
  }
  return data;
}

export async function getInboxItems() {
  await ensureAnonymousUser();
  const { data, error } = await getSupabaseBrowserClient()
    .from("inbox_items")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getInboxItemById(id: string) {
  await ensureAnonymousUser();
  const { data, error } = await getSupabaseBrowserClient()
    .from("inbox_items")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateInboxItem(id: string, values: InboxItemUpdate) {
  await ensureAnonymousUser();
  const { data, error } = await getSupabaseBrowserClient()
    .from("inbox_items")
    .update(values)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteInboxItem(id: string) {
  const user = await ensureAnonymousUser();
  const { data, error } = await getSupabaseBrowserClient()
    .from("inbox_items")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Item could not be deleted.");
  return data;
}

export function analysisFromInboxItem(item: InboxItemRow): ScreenshotAnalysis {
  return {
    intent: item.intent,
    confidence: Number(item.confidence ?? 0),
    title: item.title,
    summary: item.summary,
    fields: item.structured_data.fields ?? [],
    actions: item.structured_data.actions ?? [],
  };
}

export type { InboxItemStatus };

function extensionFor(type: string) {
  if (type === "image/jpeg") return "jpg";
  if (type === "image/webp") return "webp";
  return "png";
}
