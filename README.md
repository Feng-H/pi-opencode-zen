# pi-opencode-zen

[![npm version](https://img.shields.io/npm/v/pi-opencode-zen.svg?color=blue)](https://www.npmjs.com/package/pi-opencode-zen)
[![npm downloads](https://img.shields.io/npm/dt/pi-opencode-zen.svg?color=green)](https://www.npmjs.com/package/pi-opencode-zen)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**[English](#how-it-works) | [简体中文](#中文说明)**

> Use [OpenCode Zen](https://opencode.ai/zen)'s **free** models (e.g. `nemotron-3.5-lightning-free`, `mimo-v2.5-free`) inside the [pi](https://pi.dev) coding agent. No API key, no account, no login.

## Install

Install via **npm** (recommended):

```bash
pi install npm:pi-opencode-zen
```

Or install directly from **GitHub**:

```bash
pi install git:github.com/Feng-H/pi-opencode-zen
```

Zero config — after installing, switch models with `/model` inside pi and pick a free model under `opencode-zen`.

## How it works

OpenCode Zen exposes an OpenAI-compatible endpoint at `https://opencode.ai/zen/v1`. As of **2026-09** it grants free-tier access when a request:

- carries an **empty** `Authorization: Bearer ` header (any non-empty invalid token is rejected with `401`), **and**
- includes an **`x-session-id` header** — without it, Zen rejects with `MissingSessionID: OpenCode's free tier can only be used in OpenCode`. The extension generates one stable UUID per client startup, which is sufficient.

The extension registers an `opencode-zen` provider that points pi at the Zen endpoint, sets both headers, and fetches the live model list from `/models` at startup (falling back to a static list on failure).

## Models

Fetched dynamically; only free models (id containing `-free`) are registered. Current pool (verified 2026-09-15):

| Model | Reasoning | Notes |
|-------|-----------|-------|
| `nemotron-3.5-lightning-free` | yes | **verified working** |
| `nemotron-3-ultra-free` | yes | |
| `mimo-v2.5-free` | yes | often rate-limited |
| `muse-spark-1.3-contributor-free` | no | currently 500s upstream |
| `muse-spark-1.2-contributor-free` | no | currently 500s upstream |
| `ling-3.0-flash-fin-free` | no | Ant Ling (finance-tuned) |
| `deepseek-v4-flash-free` | — | **retired upstream** |

The pool rotates: new `-free` models appear automatically; individual models may be rate-limited or unavailable at any time — try another one.

---

## 中文说明

[![npm version](https://img.shields.io/npm/v/pi-opencode-zen.svg?color=blue)](https://www.npmjs.com/package/pi-opencode-zen)
[![npm downloads](https://img.shields.io/npm/dt/pi-opencode-zen.svg?color=green)](https://www.npmjs.com/package/pi-opencode-zen)

> 在 [pi](https://pi.dev) 中使用 [OpenCode Zen](https://opencode.ai/zen) 的**免费**模型（如 `nemotron-3.5-lightning-free`、`mimo-v2.5-free`）。无需 API key、无需注册、无需登录。

### 安装方式

通过 **npm 官方镜像** 安装（推荐）：

```bash
pi install npm:pi-opencode-zen
```

或者直接从 **GitHub** 安装：

```bash
pi install git:github.com/Feng-H/pi-opencode-zen
```

- npm 官方包页面：[https://www.npmjs.com/package/pi-opencode-zen](https://www.npmjs.com/package/pi-opencode-zen)

零配置 —— 装好后 pi 对话里 `/model` 切换,选 `opencode-zen` 下的免费模型即可。

### 工作原理

OpenCode Zen 提供 OpenAI 兼容端点 `https://opencode.ai/zen/v1`。**2026-09 起**免费访问需同时满足:

- `Authorization: Bearer `（**空** Bearer —— 填任何非空无效 token 反而被 401 拒绝）;
- 携带 **`x-session-id` 请求头** —— 缺了直接报 `MissingSessionID: OpenCode's free tier can only be used in OpenCode`。扩展每次启动生成一个稳定 UUID 即可满足。

扩展注册 `opencode-zen` provider,带上上述两个头,启动时从 `/models` 动态拉取模型列表（失败则回退静态列表）。

### 模型

动态拉取,只注册 id 含 `-free` 的免费模型（非免费模型匿名访问会被 401）。当前免费池（2026-09-15 实测）:

| 模型 | 推理 | 说明 |
|-------|-----------|-------|
| `nemotron-3.5-lightning-free` | 是 | **实测可用** |
| `nemotron-3-ultra-free` | 是 | |
| `mimo-v2.5-free` | 是 | 经常限流 |
| `muse-spark-1.3-contributor-free` | 否 | 上游目前 500 |
| `muse-spark-1.2-contributor-free` | 否 | 上游目前 500 |
| `ling-3.0-flash-fin-free` | 否 | 蚂蚁 Ling（金融向） |
| `deepseek-v4-flash-free` | — | **上游已下线** |

免费池会轮换:新 `-free` 模型自动出现;个别模型可能随时限流或不可用 —— 换一个试即可。

### 限制

- **有限流**:免费模型共享公共配额,不适合重度/自动化使用;
- **尽力而为**:依赖第三方免费服务,策略随时可能变化（如 2026-09 的 SessionID 门禁）;
- **成本按零上报**（访问本身免费）。

## License

MIT
