## Context

DeepSeek WebUI 是纯前端对话台：Next.js App Router + Ant Design + CSS Modules + Zustand。对话页已是「应用导航 | 会话轨 | 消息列 + 底栏输入」。视觉仍是浅色中性底 + Ant primary `#1890ff`。

流式回复写在未 persist 的 `chat-streaming-store`；完成后 `addMessage` 把助手消息写入 `chat-store`。`buildMessageListItems` 只要 `streamingContent` / `streamingReasoning` 非空就追加一行。`chat-input` 用 `requestAnimationFrame` 节流流式写入，结束时 `clearSessionStreaming` 无法取消已排队的 rAF，完成后仍可能再写回流式内容，于是落盘气泡与流式气泡并存。

grilling 已锁定：墨蓝控制台、整站同一套 token、对话区为唯一记忆点、Noto Sans SC + Chakra Petch + IBM Plex Mono、仅流式时指示条呼吸。

## Goals / Non-Goals

**Goals:**

- 整站（导航、对话、设置、模板、工作流）使用同一套墨蓝 token 与字体
- 对话区呈现淡网格 + 助手左侧电蓝指示条；仅 loading 时呼吸
- 一条助手回复在完成后只出现一个气泡
- 布局骨架、会话模型、发送路径不变

**Non-Goals:**

- 多主题切换或跟随系统 light/dark
- 重做路由、表单结构、会话数据模型
- 黑底酸绿 / 扫描线屏保级动效
- 会话列表虚拟化、服务端主题

## Decisions

### D1. Token 集中在 `deepseek.ts` + CSS 变量，Ant Design 走 dark algorithm

- **选择**：在 `src/lib/theme/deepseek.ts` 导出命名色板与 Ant `theme` token；`:root`（或 `body`）挂 CSS 变量；`ConfigProvider` 使用 `theme.darkAlgorithm` 并覆盖 `colorPrimary` 为 Signal `#3BA7FF`。
- **备选**：只改 CSS Modules、不碰 Ant → 设置页 Table/Modal/Form 仍浅色。
- **理由**：整站同一套 token 的验收点是 Ant 组件也变暗，不能只换聊天壳。

色板：

| Token | Hex |
|---|---|
| Ink | `#08131F` |
| Panel | `#0E1C2E` |
| Deck | `#122033` |
| Line | `#1A3A52` |
| Signal | `#3BA7FF` |
| Text | `#DCE8F5` |
| Dim | `#7A93AB` |

`DEEPSEEK_BLUE` 从 `#1890ff` 更新为 Signal，避免两套主色。

### D2. 字体：`next/font` 加载三族，中文不拿拉丁显示体硬撑

- **选择**：`Chakra_Petch`（Logo / 少量标题）、`Noto_Sans_SC`（正文）、`IBM_Plex_Mono`（时间、R1、代码）经 `next/font/google` 注入 CSS 变量。
- **备选**：系统字体栈 → 科技感弱；Orbitron 等 HUD 显示体 → 廉价游戏感。
- **理由**：grilling 选项 A。

### D3. 记忆点只做在消息列，侧栏保持安静

- **选择**：`.messagePane` / `.messageList` 使用极淡网格（Signal 低透明度 repeating-linear-gradient 或 SVG data-uri）。助手气泡左侧 2px 电蓝条；`data-streaming-bubble` 时 CSS 呼吸动画；`prefers-reduced-motion: reduce` 时取消动画、条常亮。用户气泡靠右、无指示条。
- **备选**：导航品牌柱或输入栏终端风。
- **理由**：产品主任务是对话；大胆只用一处。

### D4. 流式行只在 loading 时存在，并取消 pending rAF

- **选择**：
  1. `createRafThrottle` 返回 `cancel()`（`cancelAnimationFrame` + 丢弃 pending）。
  2. `sendMessage` 的 `finally` 先 `cancel()` 再 `setLoading(false)` + `clearSessionStreaming`。
  3. `buildMessageListItems` 增加 `isLoading`：仅当 `isLoading === true` 且存在 streaming content/reasoning 时追加 streaming 行。
- **备选**：只清 store、不改 list assembler → rAF 竞态仍会复现；只改 list、不 cancel rAF → loading 结束后安全，但 store 里会短暂脏数据。
- **理由**：两层一起做，测试可锁定 list 行为，运行时无复活的流式写入。

### D5. 骨架不动，用现有 CSS Modules 换肤

- **选择**：不新增设计系统包；改现有 `src/styles/**/*.module.css` 与 `antd-overrides.css` 引用 CSS 变量。
- **备选**：引入 Tailwind 暗色主题重写所有 class → 范围爆炸，且仓库已混用 CSS Modules。
- **理由**：proposal 明确「骨架与信息结构不变」。

## Risks / Trade-offs

- [Ant 暗色覆盖不全] → 设置页个别控件发白。缓解：`antd-overrides.css` 补 Modal/Drawer/Table/Input；验收时扫设置/模板/工作流。
- [中文字体包体积] → Noto Sans SC 子集化（`next/font` 的 `subsets` / 按需）。缓解：只加载 `latin` + `chinese-simplified` 可用子集。
- [网格影响可读性] → 透明度必须极低；对比度以 Text on Deck 为准。
- [rAF cancel 与 Strict Mode] → 测试覆盖「完成后 isLoading=false 即使 streaming 字符串仍在也不追加行」。

## Migration Plan

- 纯前端视觉 + 客户端流式时序，无数据迁移。
- 回滚：还原 theme/CSS/fonts 与 `message-list-items` / `chat-input` 节流。
- `localStorage` 中的会话与 API Key 不受影响。

## Open Questions

- 无。grilling 已关闭基调、范围、记忆点、字体、动效。
