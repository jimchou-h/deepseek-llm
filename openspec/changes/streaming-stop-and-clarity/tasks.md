## 1. SSE 解析可测化与注释

- [x] 1.1 抽出 SSE buffer 解析纯函数（含 `\n\n` 事件边界与 `data:` / `[DONE]`），补充中文注释说明为何 `TextDecoder({ stream: true })` 与为何不能按 chunk 当事件；单测覆盖：跨 chunk 半包事件、一块多事件、`[DONE]`。验收：相关单测红→绿；`deepseek` 主读循环调用该解析器。

## 2. 停止生成（Abort + runId）

- [x] 2.1 为 `chatCompletion`（及复用读循环处）接入 `AbortSignal`，abort 时结束读取且可区分用户中止。验收：单测或可控 mock 下 abort 不再继续回调 onStream。
- [x] 2.2 发送编排引入 per-session `runId` + `AbortController`；输入区在 loading 时提供停止；停止后落盘已有部分文本（非空）、cancel rAF、校验旧 run 的 finally 不清理新 run。验收：手动或单测验证「停→立刻重发」不串内容；对照 streaming-generation-control 场景。

## 3. 完成 / 断流语义

- [x] 3.1 正常结束需见到完成标记或等价约定；无标记且非用户 abort 的提前结束视为 incomplete 并提示用户。验收：单测区分 complete / aborted / incomplete。

## 4. 可读性整理

- [x] 4.1 收敛 `deepseek.ts` 二次 tool 流与主循环的重复 reader 逻辑到共享辅助；去掉噪音 `console.log`；为编排步骤加简短分段注释（不写废话）。验收：主路径函数职责清晰，lint/类型通过。
