# CONTEXT

本仓库的领域术语、编码/样式约定与验证门禁的单一文档入口。与 `agents.md` / `docs/agents/domain.md` 引用的路径一致。代码是唯一事实源；本文只记录**无法从代码直接看出的**语义与约定。

## 1. 领域术语表

| 术语 | 含义 | 落点 |
|---|---|---|
| **会话（Session）** | 一段独立多轮对话，含 `messages[]`、标题、时间戳。多会话并存，切换不丢流式状态。 | `src/lib/chat/session-utils.ts`、`chat-store` |
| **会话级模型覆盖（Session.model）** | `Session.model?: ModelType`。缺省跟随全局设置；工具栏选择器为单会话覆盖，下一条消息起生效。解析用 `resolveSessionModel(sessionModel, globalModel)`。 | `src/lib/chat/session-model.ts` |
| **模型档位（ModelType）** | 仅 `'pro' \| 'flash'`，映射 `deepseek-v4-pro` / `deepseek-v4-flash`。旧的 chat/coder/reasoner 已删除；持久化的遗留值迁移时回落 `pro`。 | `src/lib/api/config.ts` |
| **上下文窗口（Context Window）** | 送 API 前对消息做的裁剪：默认最近 `DEFAULT_CONTEXT_MESSAGE_LIMIT = 20` 条；单条正文超 `MAX_MESSAGE_CONTENT_CHARS = 8000` 字符在**出参副本**上截断（store/UI 数据不动）。`max_tokens` 固定 8192。 | `src/lib/chat/context-window.ts` |
| **水合 gating（Hydration）** | chat-store 落 IndexedDB（`idb-keyval`），读取是异步的。UI 在 `hasHydrated` 前显示骨架并禁用发送，避免用户操作被后到的水合覆盖。 | `chat-store.persist`、`use-chat-hydrated.ts` |
| **run（会话内单次生成）** | 每会话同时最多一个「当前 run」，带 `runId` + `AbortController`。停止或新发送即换 runId，旧 run 的迟到 chunk / finally 因 runId 校验失败被丢弃。 | `src/lib/chat/session-run.ts` |
| **流式状态（chat-streaming-store）** | 与 `chat-store` 分离：只存「正在生成的那一条」的临时态（streaming 文本/思考/当前 run），完成才并入 Session。 | `src/lib/store/chat-streaming-store.ts` |
| **SSE 解析（sse-parse）** | DeepSeek 流式响应的增量分帧解析，独立可测模块。 | `src/lib/chat/sse-parse.ts` |

## 2. 样式使用边界（双轨约定）

- **布局、页面骨架、皮肤（配色/间距/边框/主题变量）**：一律用 CSS Modules，放 `src/styles/**`（按域分子目录，如 `src/styles/chat/`）。主题变量走 CSS 自定义属性（`--ink` / `--panel` / `--line` / `--signal` 等）。
- **markdown 消息渲染区**（`message-content.tsx` 及其 `code-block.tsx`）：允许并倾向使用 Tailwind 工具类（内容排版随 `react-markdown` 组件树，作用域局部化）。
- **同一职责不得两种体系混用**：一个元素的间距/配色不同时由 CSS Module 与 Tailwind 表达。
- **antd 组件覆盖**：优先 antd `styles`/`className` 传入 + CSS Module 定义，不用全局选择器打补丁（Drawer 内 `:global(aside)` 这类局部逃生口需在注释写明原因）。

判定口诀：**改工具栏/侧栏/卡片外观 → CSS Module；改正文代码块/行内码 → Tailwind。**

## 3. 验证门禁清单

每个 change 验收前，以下须全部通过：

| 门禁 | 命令 |
|---|---|
| Lint | `npm run lint`（next@14.1 `next lint`，读 `.eslintrc.json`；flat `eslint.config.mjs` 委托同一份配置） |
| 类型 | `npx tsc --noEmit` |
| 单测 | `npx vitest run` |
| 规格 | `npx openspec validate --all --strict` |

注：`.eslintrc.json` 只 extends `next/core-web-vitals`，不含 `next/typescript`（`eslint-config-next@14.1.0` 未提供该共享配置）；类型正确性由 `tsc --strict` 兜底。
