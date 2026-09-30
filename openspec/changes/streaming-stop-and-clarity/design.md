## Context

客户端直连 DeepSeek：`chatCompletion` 手写 SSE；`ChatInput.sendMessage` 用 sessionId 绑定流式 store，并用 `createRafThrottle` 刷 UI。无停止、无 abort、无 run 代际。`deepseek.ts` 内嵌二次 tool-call 循环，可读性差。

约束：继续无后端；停止只能 abort 浏览器侧 fetch；DeepSeek 侧可能仍继续计费/生成——产品文案需诚实（本 change 至少代码注释与 UI 可用「停止接收」语义）。

## Goals / Non-Goals

**Goals:**

- 可停止当前会话生成，且不污染后续发送
- 完成 / 用户中止 / 异常断流可区分（至少在 API 返回或错误类型上可测）
- SSE 解析与解码逻辑可单测、有清晰注释
- 发送编排可读：controller、runId、rAF、落盘顺序一眼能跟

**Non-Goals:**

- 服务端取消上游模型
- Markdown 缓存、代码高亮 Worker
- 重新启用 tools 请求体
- 全局同时仅允许一个会话流（已有按 session 隔离可保留）

## Decisions

### 1. runId + AbortController 放在发送编排层

- **选择**：`ChatInput`（或抽出的 `sendChatMessage` 纯编排模块）持有 `Map`/`ref`：`sessionId → { runId, controller }`。
- `chatCompletion` 接收可选 `signal: AbortSignal`，在 `fetch` 与读循环中尊重 abort。
- **为何不把 runId 只放进 deepseek**：归属校验要挡住「写 store / 落盘」，属于 UI/状态边界。

### 2. 停止语义命名

- UI 文案倾向「停止」；实现注释标明：**停止接收与渲染**，不保证上游模型立刻停。

### 3. SSE 解析抽取为纯函数

- 输入：新 chunk bytes/string + 既有 buffer → 输出：完整事件列表 + 剩余 buffer。
- 解码：`TextDecoder` `{ stream: true }` 留在 reader 循环；事件切分优先按空行 `\n\n`（与方案一致），兼容常见单行 `data:`。
- `[DONE]` 标记流正常结束意图；仅 `reader.done` 且从未见结束标记时抛/返回 `aborted`/`incomplete` 类结果（设计实现时定一种对外类型）。

### 4. finally 与代际

```text
stop/send(new):
  invalidate old runId
  cancel rAF
  abort old controller

finally(oldRun):
  if (currentRunId !== oldRunId) return  // 不清理新任务
  else clear loading/streaming
```

### 5. 可读性改动范围

- 抽 `parseSseBuffer`（或同名）+ 注释「为何 stream:true」「为何不能按 chunk 当事件」
- `chatCompletion` 拆：主读循环 /（保留但隔离）tool 二次请求块
- 禁止大段无结构的复制粘贴二次 reader；二次流复用同一解析辅助函数

## Risks / Trade-offs

- **[Risk] abort 后 DeepSeek 仍计费** → UI/注释说明；后续代理再真正 cancel。
- **[Risk] 按 `\n\n` 切与旧按行行为差异** → 单测覆盖 OpenAI 风格单行事件与跨 chunk。
- **[Trade-off] 不缓存 Markdown** → 长回答卡顿仍在；本 change 以停止与结构清晰优先。

## Migration Plan

无 persist 形状变更。部署后旧客户端行为不变直至发版。

## Open Questions

- 停止后是否保留已流出的部分文本为一条 assistant 消息？**倾向：保留已生成内容落盘**（更好 UX）；若 abort 时尚无字符则不落盘。实现前以 spec 场景钉死。
