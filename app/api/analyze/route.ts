import {
  analyzeScreenshot,
} from "@/lib/ai/analyzeScreenshot";
import { AnalysisOutputError } from "@/lib/ai/analysisContract";
import { ZhipuConfigurationError, ZhipuProviderError } from "@/lib/ai/providers/zhipu";

export const maxDuration = 120;

const ACCEPTED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
  const formData = await request.formData();
  const screenshot = formData.get("screenshot");

  if (!(screenshot instanceof File)) {
    return Response.json({ error: "A screenshot file is required." }, { status: 400 });
  }
  if (!ACCEPTED_TYPES.has(screenshot.type)) {
    return Response.json({ error: "Unsupported file type. Use PNG, JPG, or WEBP." }, { status: 415 });
  }
  if (screenshot.size > MAX_FILE_SIZE) {
    return Response.json({ error: "Image is too large. The maximum file size is 10 MB." }, { status: 413 });
  }
  if (screenshot.size === 0) {
    return Response.json({ error: "The uploaded screenshot is empty or unreadable." }, { status: 400 });
  }

  try {
    const bytes = Buffer.from(await screenshot.arrayBuffer());
    const imageUrl = `data:${screenshot.type};base64,${bytes.toString("base64")}`;
    const result = await analyzeScreenshot(imageUrl);

    return Response.json({
      id: crypto.randomUUID(),
      status: "complete",
      upload: {
        name: screenshot.name,
        size: screenshot.size,
        type: screenshot.type,
      },
      result,
    });
  } catch (error) {
    if (error instanceof ZhipuConfigurationError) {
      return Response.json({ error: "AI analysis is not configured. Add ZHIPU_API_KEY to .env.local." }, { status: 503 });
    }
    if (error instanceof AnalysisOutputError) {
      return Response.json({ error: "AI returned an invalid analysis. Please try again." }, { status: 502 });
    }
    if (error instanceof ZhipuProviderError) {
      if (error.kind === "authentication") return Response.json({ error: "AI provider authentication failed. Check the server configuration." }, { status: 502 });
      if (error.kind === "rate_limit") return Response.json({ error: "AI analysis is temporarily rate limited. Please try again." }, { status: 429 });
      if (error.kind === "timeout") return Response.json({ error: "AI analysis timed out. Please try again." }, { status: 504 });
      return Response.json({ error: "AI analysis failed. Please try again." }, { status: 502 });
    }
    console.error("Screenshot analysis failed", error instanceof Error ? error.name : "UnknownError");
    return Response.json({ error: "AI analysis failed. Please try again." }, { status: 500 });
  }
}
