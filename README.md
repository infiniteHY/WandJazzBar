# Wand Jazz Bar

Wand Jazz Bar is a Next.js app that turns cocktail-style choices into a generated jazz track. The experience now opens directly into the bar; there is no login gate.

## Features

- Direct entry to the jazz bar
- Cocktail parameter selection
- English and Chinese generated titles and poems
- Tone.js playback for generated melody and chords
- Pixel-neon visual style

## Tech Stack

- Framework: Next.js 14 with App Router
- Language: TypeScript
- Styling: Tailwind CSS
- Database: Prisma-backed relational database
- Audio: Tone.js

## Quick Start

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

The app runs at `http://localhost:3000` and redirects to `/jazz-bar`.

## Project Structure

```text
app/
  api/
    jazz/
  jazz-bar/
    components/
    context/
lib/
  jazz/
  prisma.ts
prisma/
  schema.prisma
```

## 使用 Codex 开发本项目

[Codex](https://learn.chatgpt.com/docs/codex) 是 OpenAI 的编程智能体，可以读取仓库、修改文件、执行命令、运行测试并审查变更。它适合用来理解 Wand Jazz Bar、实现功能、排查问题和做代码审查。Codex 与 GPT-5.6 的关系是：Codex 提供完整的开发工作流，GPT-5.6 则是可以驱动该工作流的模型之一。

### 1. 安装并登录 Codex CLI

macOS 或 Linux 可以使用官方安装脚本：

```bash
curl -fsSL https://chatgpt.com/codex/install.sh | sh
```

也可以通过 npm 安装：

```bash
npm install -g @openai/codex
```

进入项目目录后启动 Codex：

```bash
cd WandJazzBar
codex
```

首次启动时按提示使用 ChatGPT 或其他可用方式登录。登录成功后，Codex 默认以当前目录作为工作范围，因此应从仓库根目录启动。

### 2. 选择 GPT-5.6

在交互会话中输入 `/model`，可以选择模型和推理强度。也可以在启动时直接指定：

```bash
codex --model gpt-5.6
```

`gpt-5.6` 是指向旗舰模型 `gpt-5.6-sol` 的别名。如果希望明确固定模型，也可以使用：

```bash
codex --model gpt-5.6-sol
```

推理强度越高，复杂任务通常越可靠，但耗时和 token 消耗也会增加。一般先使用默认或 `medium`；涉及跨文件重构、复杂故障定位、安全审查时，再考虑 `high`、`xhigh` 或 `max`。

### 3. 推荐的交互方式

给 Codex 的任务应尽量包含目标、范围、约束和验收标准。例如：

```text
检查 app/jazz-bar 下的播放逻辑，修复切换曲目后旧音轨仍继续播放的问题。
不要改变页面视觉样式；完成后运行 lint 和相关测试，并总结修改过的文件。
```

常见命令：

- `/status`：查看当前模型、目录、权限等会话状态。
- `/model`：切换模型或调整推理强度。
- `/permissions`：设置 Codex 可以执行的操作及审批边界。
- `/review`：审查当前代码变更并查找缺陷。
- `/init`：为仓库生成 `AGENTS.md`，保存长期有效的项目约定。

建议一次交付一个边界清晰的任务。对本地读取、修改和测试，可以在提示中直接授权；涉及删除数据、外部发布、付费操作或扩大工作范围时，应要求 Codex 先确认。执行前后保留 Git 检查点，并始终审阅最终 diff。

### 4. 非交互和 CI 用法

一次性任务可以使用 `codex exec`：

```bash
codex exec -m gpt-5.6 "Review the current changes and report correctness issues"
```

这种方式适合脚本和 CI。自动化场景应给出明确的输出格式、失败条件和权限限制，避免让流水线执行未经确认的发布或破坏性操作。

## 通过 API 使用 GPT-5.6

如果要在应用或独立脚本中直接调用模型，应使用 OpenAI API；这与使用 Codex CLI 是两种不同入口。对于推理、工具调用和多轮工作流，官方推荐使用 Responses API。

### 1. 模型选择

GPT-5.6 系列可以按质量、成本和吞吐量选择：

| 模型 | 适用场景 |
| --- | --- |
| `gpt-5.6` / `gpt-5.6-sol` | 旗舰能力，适合复杂开发、深度分析和质量优先的任务 |
| `gpt-5.6-terra` | 智能与成本的平衡，适合大多数生产工作流 |
| `gpt-5.6-luna` | 高吞吐、成本敏感和相对简单的批量任务 |

### 2. Node.js 最小示例

安装官方 SDK，并通过环境变量提供密钥；不要把 API Key 提交到 Git：

```bash
npm install openai
export OPENAI_API_KEY="your_api_key"
```

```ts
import OpenAI from "openai";

const client = new OpenAI();

const response = await client.responses.create({
  model: "gpt-5.6",
  input: "为一杯烟熏风味的鸡尾酒生成英文爵士曲名和四行中文短诗。",
  reasoning: {
    effort: "medium",
  },
  text: {
    verbosity: "medium",
  },
});

console.log(response.output_text);
```

生产代码中应从服务端调用 API，避免在浏览器端暴露密钥。建议将模型名放入环境变量，例如 `OPENAI_MODEL=gpt-5.6`，方便测试和切换模型。

### 3. 推理强度与 Pro 模式

GPT-5.6 支持 `none`、`low`、`medium`、`high`、`xhigh` 和 `max` 推理强度：

- `low`：延迟敏感、任务简单或高吞吐场景。
- `medium`：默认的平衡起点，适合大多数请求。
- `high` / `xhigh`：复杂编码、规划和分析任务，但应通过真实样本验证收益。
- `max`：仅用于最困难、质量优先的任务，成本和延迟最高。

对于高价值且确实困难的请求，可以在相同模型上开启 Pro 模式：

```ts
const response = await client.responses.create({
  model: "gpt-5.6",
  input: "审查这份数据库迁移计划，按严重程度列出可能导致数据丢失的五个风险。",
  reasoning: {
    effort: "high",
    mode: "pro",
  },
});
```

Pro 是执行模式，不是独立的模型名称。它会增加模型工作量、延迟和 token 消耗，因此应使用代表性任务比较标准模式与 Pro 模式的质量和成本。

### 4. 提示词实践

GPT-5.6 更适合简洁、结果导向的提示词。推荐结构如下：

```text
目标：要完成什么。
上下文：模型完成任务所需的代码、数据或业务背景。
约束：不能修改什么、允许使用哪些工具、何时需要审批。
成功标准：怎样才算完成，需要运行哪些验证。
输出格式：JSON、Markdown、代码补丁或简短说明。
```

每条要求尽量只写一次，只提供当前任务需要的工具和示例。对于面向终端用户的应用，请传入稳定且保护隐私的 `safety_identifier`，并为限流、超时、拒绝、重试和日志脱敏做好处理。

### 5. Codex 与 API 应该怎样选

- 需要让智能体直接理解、编辑和验证当前仓库：使用 Codex。
- 需要在 Wand Jazz Bar 产品功能中生成内容：在服务端使用 GPT-5.6 Responses API。
- 需要自动化代码审查或 CI 任务：使用 `codex exec`，并设置严格权限和输出约束。
- 需要稳定上线模型能力：先用代表性数据评测质量、延迟和成本，再确定模型与推理强度，不要默认最高档一定最合适。

官方资料：[Codex CLI](https://learn.chatgpt.com/docs/codex/cli)、[Codex 模型选择](https://learn.chatgpt.com/docs/models)、[GPT-5.6 使用指南](https://developers.openai.com/api/docs/guides/latest-model)、[OpenAI API Quickstart](https://developers.openai.com/api/docs/quickstart)。

## Notes

- `JazzTrack` stores cocktail parameters, generated metadata, bilingual poems, chord data, melody data, and instruments.
- Existing auth-related database fields may remain for compatibility with older data, but the current product flow does not require authentication.
