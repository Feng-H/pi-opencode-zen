# pi-opencode-zen

Use [OpenCode Zen](https://opencode.ai/zen)'s **free** models (e.g. `deepseek-v4-flash-free`) inside the [pi](https://pi.dev) coding agent. No API key, no account, no login.

## Install

```bash
pi install npm:pi-opencode-zen
```

## Usage (中文 / English)

安装后**无需任何配置**，在 pi 对话里用 `/model` 切换即可。不需要 API key、不需要登录、也不用改 `settings.json`。

After installing, **no configuration is needed** — just switch models with `/model` inside the pi dialog. No API key, no login, and no need to edit `settings.json`.

### 中文

1. 安装：`pi install npm:pi-opencode-zen`
2. 在对话中输入 `/model`，选择 `opencode-zen` 下的 free 模型（如 `deepseek-v4-flash-free`）
3. 直接开用。免费匿名访问，无需任何 key
4. 想每次启动自动用这个模型？在 `~/.pi/agent/settings.json` 里设置 `"defaultProvider": "opencode-zen"` 和 `"defaultModel": "deepseek-v4-flash-free"`（**可选**，不设也能正常用）

### English

1. Install: `pi install npm:pi-opencode-zen`
2. Type `/model` in the dialog and pick a free model under `opencode-zen` (e.g. `deepseek-v4-flash-free`)
3. Start chatting. Anonymous free access — no key needed.
4. Want it as the default on startup? Set `"defaultProvider": "opencode-zen"` and `"defaultModel": "deepseek-v4-flash-free"` in `~/.pi/agent/settings.json` (**optional** — works fine without it)

> The package itself is enough. The `settings.json` defaults are only a convenience so you don't have to pick the model every session.
>
> 只装 package 就能用；改默认值只是省去每次手动切换的便利选项。

## How it works

OpenCode Zen exposes an OpenAI-compatible endpoint at `https://opencode.ai/zen/v1`. It grants anonymous access to its free-tier models when the request carries **no** Authorization header (or an empty `Bearer `). Any non-empty invalid token is rejected with `401`.

This extension registers an `opencode-zen` provider that:

- Points pi at the Zen endpoint with the standard `openai-completions` API
- Overrides the `Authorization` header to an empty `Bearer ` to replicate the OpenCode client's anonymous access
- Fetches the live model list from `/models` at startup (falls back to a static list on failure)

## Models

The catalog is fetched dynamically from Zen's `/models` endpoint. Only free models (id ending in `-free`) are registered, because anonymous access to non-free models is rejected with `401`.

| Model | Reasoning | Notes |
|-------|-----------|-------|
| `deepseek-v4-flash-free` | yes | DeepSeek V4 Flash |
| `laguna-s-2.1-free` | no | |
| `ling-3.0-flash-free` | no | Ant Ling |
| `longcat-2.0-free` | no | |
| `mimo-v2.5-free` | no | Xiaomi MiMo |
| `nemotron-3-ultra-free` | no | NVIDIA Nemotron |
| `north-mini-code-free` | no | |

All free (cost reported as zero). New `-free` models appear automatically once Zen lists them.

## Limitations

- **Rate limited.** Free models share a public quota; bursts get temporarily throttled (recovers after a few seconds). Not suitable for heavy/automated use.
- **Best-effort.** Depends on a third-party free service that may change at any time.
- **Costs are reported as zero**, since access is free.

## License

MIT
