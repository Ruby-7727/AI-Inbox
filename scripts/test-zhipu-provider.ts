import assert from "node:assert/strict";
import { createServer } from "node:http";

const providerPort = 3211;

let mode: "success" | "auth" | "rate" | "malformed" | "timeout" = "success";
let capturedBody: Record<string, unknown> | null = null;

const provider = createServer((request, response) => {
  let body = "";
  request.on("data", (chunk) => { body += String(chunk); });
  request.on("end", () => {
    capturedBody = JSON.parse(body) as Record<string, unknown>;
    response.setHeader("Content-Type", "application/json");
    if (mode === "auth") { response.statusCode = 401; response.end(JSON.stringify({ error: { message: "secret provider detail" } })); return; }
    if (mode === "rate") { response.statusCode = 429; response.end(JSON.stringify({ error: { message: "rate limit" } })); return; }
    if (mode === "timeout") return;
    const content = mode === "malformed"
      ? "not-json"
      : JSON.stringify({ intent: "shop", confidence: 88, title: "Headphones", summary: "A product screenshot.", fields: [{ key: "price", label: "Price", value: null }], actions: ["save", "compare", "research"] });
    response.end(JSON.stringify({ choices: [{ message: { content, reasoning_content: "must never be consumed" } }] }));
  });
});

async function main() {
  await new Promise<void>((resolve) => provider.listen(providerPort, "127.0.0.1", resolve));
  process.env.ZHIPU_API_KEY = "test-placeholder";
  process.env.ZHIPU_API_BASE_URL = `http://127.0.0.1:${providerPort}/`;
  process.env.ZHIPU_API_TIMEOUT_MS = "100";

  try {
  const { POST } = await import("../app/api/analyze/route");
  const success = await callAnalyze(POST);
  assert.equal(success.status, 200);
  assert.equal(success.body.result.intent, "shop");
  assert.deepEqual(success.body.result.actions, ["save", "compare", "research"]);
  assertProviderRequest();

  mode = "auth";
  const auth = await callAnalyze(POST);
  assert.equal(auth.status, 502);
  assert.equal(auth.body.error, "AI provider authentication failed. Check the server configuration.");
  assert.doesNotMatch(JSON.stringify(auth.body), /secret provider detail/);

  mode = "rate";
  assert.equal((await callAnalyze(POST)).status, 429);

  mode = "malformed";
  assert.equal((await callAnalyze(POST)).status, 502);

  mode = "timeout";
  assert.equal((await callAnalyze(POST)).status, 504);

    console.log("Zhipu provider boundary passed: Base64 image, JSON normalization, auth, rate limit, malformed output, and timeout.");
  } finally {
    provider.close();
  }
}

void main();

async function callAnalyze(POST: (request: Request) => Promise<Response>) {
  const formData = new FormData();
  formData.append("screenshot", new Blob([tinyPng()], { type: "image/png" }), "test.png");
  const response = await POST(new Request("http://localhost/api/analyze", { method: "POST", body: formData }));
  return { status: response.status, body: await response.json() };
}

function assertProviderRequest() {
  assert.ok(capturedBody);
  assert.equal(capturedBody.model, "glm-4.5v");
  assert.deepEqual(capturedBody.thinking, { type: "disabled" });
  assert.deepEqual(capturedBody.response_format, { type: "json_object" });
  const messages = capturedBody.messages as Array<{ role: string; content: unknown }>;
  const userContent = messages.find((message) => message.role === "user")?.content as Array<{ type: string; image_url?: { url: string } }>;
  assert.match(userContent[0].image_url?.url ?? "", /^data:image\/png;base64,/);
}

function tinyPng() {
  return Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64");
}
