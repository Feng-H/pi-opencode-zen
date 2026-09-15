# pi-opencode-zen

Use [OpenCode Zen](https://opencode.ai/zen)'s **free** models (e.g. `nemotron-3.5-lightning-free`, `mimo-v2.5-free`) inside the [pi](https://pi.dev) coding agent. No API key, no account, no login.

## Install

```bash
pi install npm:pi-opencode-zen
# or straight from GitHub (no npm account needed):
pi install git:github.com/Feng-H/pi-opencode-zen
```

## Usage (中文 / English)

安装后**无需任何配置**，在 pi 对话里用 `/model` 切换即可。不需要 API key、不需要登录、也不用改 `settings.json`。

After installing, **no configuration is needed** — just switch models with `/model` inside the pi dialog. No API key, no login, and no need to edit `settings.json`.

### 中文

1. 安装：`pi install npm:pi-opencode-zen`
2. 在对话中输入 `/model`，选择 `opencode-zen` 下的 free 模型（如 `nemotron-3.5-lightning-free`）
3. 直接开用。免费匿名访问，无需任何 key
4. 想每次启动自动用这个模型？在 `~/.pi/agent/settings.json` 里设置 `"defaultProvider": "opencode-zen"` 和 `"defaultModel": "nemotron-3.5-lightning-free"`（**可选**，不设也能正常用）

### English

1. Install: `pi install npm:pi-opencode-zen`
2. Type `/model` in the dialog and pick a free model under `opencode-zen` (e.g. `nemotron-3.5-lightning-free`)
3. Start chatting. Anonymous free access — no key needed.
4. Want it as the default on startup? Set `"defaultProvider": "opencode-zen"` and `"defaultModel": "nemotron-3.5-lightning-free"` in `~/.pi/agent/settings.json` (**optional** — works fine without it)

> The package itself is enough. The `settings.json` defaults are only a convenience so you don't have to pick the model every session.
>
> 只装 package 就能用；改默认值只是省去每次手动切换的便利选项。

## How it works

OpenCode Zen exposes an OpenAI-compatible endpoint at `https://opencode.ai/zen/v1`. As of **2026-09** it grants free-tier access when a request:

- carries an **empty** `Authorization: Bearer ` header (any non-empty invalid token is rejected with `401`), **and**
- includes an **`x-session-id` header** — without it, Zen rejects with `MissingSessionID: OpenCode's free tier can only be used in OpenCode`. The extension generates one stable UUID per client startup, which is sufficient.

This extension registers an `opencode-zen` provider that:

- Points pi at the Zen endpoint with the standard `openai-completions` API
- Overrides the `Authorization` header to an empty `Bearer ` and sends the stable `x-session-id` header
- Fetches the live model list from `/models` at startup (falls back to a static list on failure)

## Models

The catalog is fetched dynamically from Zen's `/models` endpoint. Only free models (id containing `-free`) are registered, because anonymous access to non-free models is rejected with `401`.

Current free pool (verified 2026-09-15):

| Model | Reasoning | Notes |
|-------|-----------|-------|
| `nemotron-3.5-lightning-free` | yes | NVIDIA Nemotron, OpenAI-style `reasoning_details` — **verified working** |
| `nemotron-3-ultra-free` | yes | NVIDIA Nemotron Ultra |
| `mimo-v2.5-free` | yes | Xiaomi MiMo (often rate-limited) |
| `muse-spark-1.3-contributor-free` | no | currently 500s upstream |
| `muse-spark-1.2-contributor-free` | no | currently 500s upstream |
| `ling-3.0-flash-fin-free` | no | Ant Ling (finance-tuned) |
| `deepseek-v4-flash-free` | — | **retired upstream** (kept in history for reference) |

All free (cost reported as zero). New `-free` models appear automatically once Zen lists them; retired ones disappear the same way. Individual models may be rate-limited or temporarily unavailable — the pool rotates.

> ⚠️ v0.2.0 and earlier are **broken**: Zen now requires the `x-session-id` header, and the old fallback model `deepseek-v4-flash-free` was retired upstream. Upgrade to v0.3.0+.

## Limitations

- **Rate limited.** Free models share a public quota; bursts get temporarily throttled. Some models are persistently throttled — try another one. Not suitable for heavy/automated use.
- **Best-effort.** Depends on a third-party free service that may change at any time (as the 2026-09 SessionID requirement showed).
- **Costs are reported as zero**, since access is free.

## License

MIT
