import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const SCREENSHOTS_BUCKET = "screenshots";

export async function getScreenshotPreviewUrl(imagePath: string) {
  const { data, error } = await getSupabaseBrowserClient().storage.from(SCREENSHOTS_BUCKET).createSignedUrl(imagePath, 60 * 60);
  if (error) throw error;
  return data.signedUrl;
}
