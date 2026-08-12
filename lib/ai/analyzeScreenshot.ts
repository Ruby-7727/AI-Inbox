import "server-only";

import {
  AnalysisOutputError,
  validateScreenshotAnalysis,
} from "@/lib/ai/analysisContract";
import { analyzeScreenshotWithZhipu } from "@/lib/ai/providers/zhipu";
import type { ScreenshotAnalysis } from "@/types/analysis";

export async function analyzeScreenshot(imageUrl: string): Promise<ScreenshotAnalysis> {
  if (!isSupportedImageUrl(imageUrl)) throw new TypeError("imageUrl must be an HTTPS URL or a PNG, JPG, or WEBP data URL.");

  const finalContent = await analyzeScreenshotWithZhipu(imageUrl);

  try {
    return validateScreenshotAnalysis(JSON.parse(normalizeJsonContent(finalContent)));
  } catch (error) {
    if (error instanceof AnalysisOutputError) throw error;
    throw new AnalysisOutputError("Zhipu returned invalid JSON.");
  }
}

function isSupportedImageUrl(value: string) {
  return /^https:\/\//i.test(value) || /^data:image\/(png|jpeg|webp);base64,/i.test(value);
}

function normalizeJsonContent(content: string) {
  const withoutThinking = content.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  const fenced = withoutThinking.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return (fenced?.[1] ?? withoutThinking).trim();
}
