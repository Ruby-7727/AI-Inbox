import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";

import { ActionResultCard } from "../components/actions/action-result-card";
import { UploadProvider } from "../components/actions/upload-provider";
import { AnalysisFailedState } from "../components/analysis/analysis-failed-state";
import { LowConfidenceResult } from "../components/analysis/low-confidence-result";
import { buildIntentPossibilities, LOW_CONFIDENCE_THRESHOLD } from "../lib/analysis/uncertainty";

assert.equal(LOW_CONFIDENCE_THRESHOLD, 60);
const possibilities = buildIntentPossibilities("remember");
assert.equal(possibilities.mostLikely, "remember");
assert.deepEqual(possibilities.alternatives, ["shop", "go", "attend"]);

const lowConfidence = renderToStaticMarkup(
  <UploadProvider><LowConfidenceResult inboxItemId="00000000-0000-4000-8000-000000000001" intent="remember" /></UploadProvider>,
);
assert.match(lowConfidence, /Low confidence result/);
assert.match(lowConfidence, /Possible categories/);
assert.match(lowConfidence, /Most likely/);
assert.match(lowConfidence, /Could also be/);
assert.doesNotMatch(lowConfidence, /%|progressbar|Category guidance/);
assert.match(lowConfidence, /Save item/);
assert.match(lowConfidence, /Upload another screenshot/);

const analysisFailed = renderToStaticMarkup(<UploadProvider><AnalysisFailedState /></UploadProvider>);
assert.match(analysisFailed, /Unable to analyze this screenshot/);
assert.match(analysisFailed, /Image quality is too low/);
assert.match(analysisFailed, /Upload another screenshot/);

const actionFailed = renderToStaticMarkup(
  <ActionResultCard actionTitle="Open Map" message="Unable to open map location" onRetry={() => undefined} status="failed" />,
);
assert.match(actionFailed, /Action failed/);
assert.match(actionFailed, /Unable to open map location/);
assert.match(actionFailed, /Retry/);

console.log("Uncertainty and failure UI tests passed.");
