## Why

当前浅色 Ant Design 壳缺乏科技感，对话结束后流式气泡与落盘气泡会叠成两个窗口。需要把整站换成已对齐的墨蓝控制台视觉，并保证一条助手回复只出现一次。

## What Changes

- 整站换用墨蓝控制台 token（Ink / Panel / Deck / Line / Signal / Text / Dim），骨架与信息结构不变
- 引入字体：正文 Noto Sans SC、Logo/少量标题 Chakra Petch、时间/R1/代码 IBM Plex Mono
- 对话区作为唯一记忆点：消息列极淡技术网格；助手气泡左侧电蓝指示条，仅流式生成时呼吸（尊重 `prefers-reduced-motion`）
- 生成结束时取消未执行的 `requestAnimationFrame`，且仅在 session loading 时渲染流式行，避免与落盘助手消息重复
- 设置、模板、工作流、导航跟随同一套 token，不重做表单与路由结构

## Capabilities

### New Capabilities

- `ink-console-theme`: 整站墨蓝控制台视觉（色板、字体、壳层、对话区网格与助手指示条）
- `streaming-bubble-lifecycle`: 流式气泡的出现/消失规则，保证完成后不与落盘消息重复

### Modified Capabilities

- `chat-shell-redesign`: 主色从 Ant `#1890ff` / 浅色画布改为 Signal `#3BA7FF` 与墨蓝控制台；三栏骨架不变

## Impact

- **Theme / fonts**: `src/app/layout.tsx`、`src/lib/theme/deepseek.ts`、`src/components/layout/app-providers.tsx`
- **Chrome CSS**: `src/styles/layout/*`、`src/styles/chat/*`、`src/styles/antd-overrides.css`、`src/styles/settings/*`
- **Chat UI**: `chat-window.tsx`、`chat-page` 壳层、`session-rail`、`chat-input`
- **Streaming**: `chat-input.tsx` RAF 节流、`message-list-items.ts` 是否追加 streaming 行
- **非目标**: 重做导航信息架构、会话数据模型、服务端主题、多主题切换、黑底酸绿 HUD
