## 1. 流式气泡生命周期（先修重复窗）

- [x] 1.1 扩展 `message-list-items` 测试：`isLoading=false` 时即使仍有 streaming 字符串也不追加流式行；`isLoading=true` 时只追加一行
- [x] 1.2 `buildMessageListItems` 接受 `isLoading`，按 spec 决定是否追加 streaming 行
- [x] 1.3 `ChatWindow` 把当前 session 的 loading 传入 list assembler
- [x] 1.4 `createRafThrottle` 提供 `cancel()`；`sendMessage` 的 `finally` 先取消 rAF，再 `setLoading(false)` 并 `clearSessionStreaming`

## 2. 墨蓝 token + 字体 + 整站壳层

- [x] 2.1 在 `deepseek.ts` 导出 Ink/Panel/Deck/Line/Signal/Text/Dim，并将 `DEEPSEEK_BLUE` 对齐 Signal
- [x] 2.2 `layout.tsx` 用 `next/font` 加载 Noto Sans SC、Chakra Petch、IBM Plex Mono，挂到 CSS 变量
- [x] 2.3 `ConfigProvider` 启用 dark algorithm，primary = Signal；`:root` 写入色板 CSS 变量
- [x] 2.4 导航、主布局、page-layout、会话轨、antd-overrides 改为引用 token（设置/模板/工作流不再出现浅色孤岛）

## 3. 对话区仪器记忆点

- [x] 3.1 消息列使用 Deck 底 + 极淡技术网格
- [x] 3.2 助手气泡左侧 Signal 指示条；用户气泡靠右且无指示条
- [x] 3.3 仅 `data-streaming-bubble` 时指示条呼吸；`prefers-reduced-motion: reduce` 时改为常亮
- [x] 3.4 时间与 R1 思考使用 IBM Plex Mono；正文保持 Noto Sans SC

## 4. 验证

- [x] 4.1 跑 `message-list-items` 与相关 store 测试，确认无重复流式行回归
- [x] 4.2 跑 lint / 类型检查
