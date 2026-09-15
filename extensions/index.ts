/**
 * pi-opencode-zen
 *
 * Registers the OpenCode Zen free provider for pi.
 *
 * OpenCode Zen (https://opencode.ai/zen) offers free access to a rotating
 * pool of `-free` models. As of 2026-09 the endpoint requires:
 *   - `Authorization: Bearer ` (empty bearer for anonymous access)
 *   - an `x-session-id` header (any stable value per client session);
 *     without it Zen rejects with `MissingSessionID: free tier can only be
 *     used in OpenCode`.
 *
 * The model list is fetched dynamically from the Zen /models endpoint at
 * startup, falling back to a static list on network failure / rate limit.
 * Individual models may be rate-limited or unavailable at any time; the
 * pool rotates, so availability is checked per model.
 */

import { randomUUID } from "node:crypto";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const ZEN_BASE_URL = "https://opencode.ai/zen/v1";

// Stable per-client session id: Zen requires it for free-tier access.
const SESSION_ID = randomUUID();

// Zen's backend rejects multi-turn requests for deepseek-style models unless
// replayed assistant messages carry `reasoning_content` when thinking is on.
const DEEPSEEK_COMPAT = {
  supportsReasoningEffort: false,
  requiresReasoningContentOnAssistantMessages: true,
};

// OpenAI-style reasoning models (e.g. nemotron) return `reasoning`/
// `reasoning_details` and do not need the deepseek replay compat.
const OPENAI_REASONING_COMPAT = {
  supportsReasoningEffort: false,
  requiresReasoningContentOnAssistantMessages: false,
};

interface ZenModel {
  id: string;
  name: string;
  reasoning: boolean;
  input: ("text" | "image")[];
  cost: { input: number; output: number; cacheRead: number; cacheWrite: number };
  contextWindow: number;
  maxTokens: number;
  compat: Record<string, unknown>;
}

// Static fallback: used when the dynamic fetch fails.
// Verified available 2026-09-15 (deepseek-v4-flash-free was retired upstream).
const FALLBACK_MODELS: ZenModel[] = [
  {
    id: "nemotron-3.5-lightning-free",
    name: "Nemotron 3.5 Lightning (Zen Free)",
    reasoning: true,
    input: ["text"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 128000,
    maxTokens: 16384,
    compat: OPENAI_REASONING_COMPAT,
  },
  {
    id: "mimo-v2.5-free",
    name: "MiMo v2.5 (Zen Free)",
    reasoning: true,
    input: ["text"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 128000,
    maxTokens: 16384,
    compat: DEEPSEEK_COMPAT,
  },
  {
    id: "nemotron-3-ultra-free",
    name: "Nemotron 3 Ultra (Zen Free)",
    reasoning: true,
    input: ["text"],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 128000,
    maxTokens: 16384,
    compat: OPENAI_REASONING_COMPAT,
  },
];

// Heuristic: known reasoning-capable families on Zen's free pool.
function guessReasoning(id: string): boolean {
  return /deepseek|reason|think|o1|o3|o4|grok|nemotron|mimo/i.test(id);
}

function compatFor(id: string): Record<string, unknown> {
  // deepseek-style models need reasoning_content replayed on assistant turns.
  return /deepseek|mimo/i.test(id) ? DEEPSEEK_COMPAT : OPENAI_REASONING_COMPAT;
}

export default async function (pi: ExtensionAPI) {
  let models: ZenModel[] = FALLBACK_MODELS;

  try {
    const res = await fetch(`${ZEN_BASE_URL}/models`, {
      signal: AbortSignal.timeout(8000),
      headers: {
        Authorization: "Bearer ",
        "x-session-id": SESSION_ID,
      },
    });
    if (res.ok) {
      const data = (await res.json()) as {
        data?: Array<{ id: string; name?: string }>;
      };
      const list = data.data;
      // Only free models (anonymous access). Zen rejects non-free models
      // with 401 for anonymous requests.
      const free = Array.isArray(list) ? list.filter((m) => m.id.includes("-free")) : [];
      if (free.length > 0) {
        models = free.map((m) => ({
          id: m.id,
          name: m.name ?? m.id,
          reasoning: guessReasoning(m.id),
          input: ["text"] as ("text" | "image")[],
          cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
          contextWindow: 128000,
          maxTokens: 16384,
          compat: compatFor(m.id),
        }));
      }
    }
  } catch {
    // Network error / rate limit / timeout → keep the static fallback.
  }

  pi.registerProvider("opencode-zen", {
    name: "OpenCode Zen (Free)",
    baseUrl: ZEN_BASE_URL,
    apiKey: "opencode-zen-free",
    api: "openai-completions",
    headers: {
      Authorization: "Bearer ",
      "x-session-id": SESSION_ID,
    },
    models,
  });
}
