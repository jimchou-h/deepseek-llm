## Why

当前对话已用 Fetch + ReadableStream 读 SSE，并用 rAF 节流渲染，但缺少「停止生成」能力：没有 AbortController、没有 runId 归属校验，断流也未与「正常完成」区分。同时 `deepseek.ts` / 发送编排路径冗长、注释不足，后续改停止与解析边界成本高。需要先补齐停止与完成语义，并顺手整理流式主路径可读性。

## What Changes

- 为每次生成分配 `runId`，配合独立 `AbortController`；用户可停止当前会话的流式回复
- 停止后丢弃旧 run 的迟到 chunk；旧 run 的 `finally` 不得清理新 run 的 loading/streaming 状态
- 明确完成 vs 中断 vs 异常断流语义（含 `[DONE]` / abort / 连接结束未完成）
- 整理流式相关代码：抽取 SSE 缓冲解析、统一注释与命名，降低 `deepseek.ts` 与 `chat-input` 编排复杂度
- **不**在本 change 引入服务端代理或「取消上游模型」；浏览器 abort 只停本地读流
- **不**在本 change 做 Markdown AST 缓存 / Web Worker 高亮（可列为后续）

## Capabilities

### New Capabilities

- `streaming-generation-control`: 流式生成的启动/停止、run 归属、Abort、完成与中断状态
- `sse-stream-parsing`: Fetch ReadableStream 上的 SSE 缓冲解析约定（含中文跨块解码）

### Modified Capabilities

- `streaming-bubble-lifecycle`: 停止或中断时流式气泡的清理与落盘规则须与 run 生命周期一致

## Impact

- **API**: `src/lib/api/deepseek.ts`（及必要时抽出的纯解析模块）
- **UI/编排**: `chat-input.tsx`、流式 store、可能的停止按钮
- **测试**: 解析/runId/abort 相关纯函数单测；rAF cancel 与现有测试对齐
- **非目标**: Coze、函数 tools 启用、Next API 代理、历史 Markdown 缓存
