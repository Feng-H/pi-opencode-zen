/**
 * pi-opencode-zen
 *
 * Registers the OpenCode Zen free provider for pi.
 *
 * OpenCode Zen (https://opencode.ai/zen) offers free, anonymous access to
 * models such as DeepSeek. The endpoint accepts anonymous requests when the
 * Authorization header is absent or an empty Bearer, and rejects non-empty
 * invalid Bearer tokens. We therefore override Authorization to an empty
 * Bearer to replicate the OpenCode client's anonymous access.
 *
 * The model list is fetched dynamically from the Zen /models endpoint at
 * startup, falling back to a static list on network failure / rate limit.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const ZEN_BASE_URL = "https://opencode.ai/zen/v1";

// Static fallback used when the dynamic fetch fails.
const FALLBACK_MODELS = [
  {
    id: "deepseek-v4-flash-free",
    name: "DeepSeek V4 Flash (Zen Free)",
    reasoning: true,
    input: ["text"] as ("text" | "image")[],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 128000,
    maxTokens: 16384,
  },
];

// Heuristic: most reasoning-capable model families on Zen.
function guessReasoning(id: string): boolean {
  return /deepseek|reason|think|o1|o3|o4|grok/i.test(id);
}

export default async function (pi: ExtensionAPI) {
  let models = FALLBACK_MODELS;

  try {
    const res = await fetch(`${ZEN_BASE_URL}/models`, {
      signal: AbortSignal.timeout(8000),
      headers: { Authorization: "Bearer " },
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
    headers: { Authorization: "Bearer " },
    models,
  });
}
