## 1. 准备与依赖

- [x] 1.1 添加 `react-virtuoso` 依赖
- [x] 1.2 扩展 `Session` / chat store 类型（`id`、`title`、`messages`、时间戳）
- [x] 1.3 将 Ant Design `ConfigProvider` 的 primary 对齐 DeepSeek 蓝（`#1890ff`），若尚未全局设置

## 2. Chat store：多会话 + 上下文条数

- [x] 2.1 重构 `chat-store` 为 `sessions` + `activeSessionId` + 按会话的 streaming/loading map
- [x] 2.2 实现 CRUD：新建 / 切换 / 删除会话；消息活动时更新 `updatedAt`
- [x] 2.3 首条用户消息自动标题（截断约 30 字）；默认标题「新对话」
- [x] 2.4 增加 `contextMessageLimit`（默认 50）及 `updateContextMessageLimit`
- [x] 2.5 实现 persist 迁移：旧版顶层 `messages` → 一个默认会话
- [x] 2.6 确保流式回调闭包捕获 `sessionId`，绝不写到错误会话

## 3. 发送路径上下文窗口 + 设置页

- [x] 3.1 在 `chat-input`（或共享 helper）中组装 API 消息：`[system?] + slice(-limit)`，取自目标会话
- [x] 3.2 设置页增加上下文条数控件（最小 1、可持久化、说明文案：UI 仍保留完整历史）

## 4. Chat 壳层 redesign

- [x] 4.1 重组对话页为「会话轨 + 消息列」（保留应用侧栏）
- [x] 4.2 实现会话列表 UI：新建 / 选中 / 删除；选中态使用 DeepSeek 蓝
- [x] 4.3 窄屏：会话轨可折叠或 Drawer
- [x] 4.4 应用 AI-Native 轻量壳样式（中性底、蓝色强调、粘底输入区）

## 5. 消息虚拟列表

- [x] 5.1 用 Virtuoso 替换 `ChatWindow` 全量 `messages.map` + Framer Motion 列表包裹
- [x] 5.2 支持动态高度气泡、流式更新最后一项、贴近底部时 follow-output
- [x] 5.3 保留气泡上的复制/删除，以及 reasoning/markdown 渲染

## 6. 验证

- [ ] 6.1 手工：新建/切换/删除会话；旧数据迁移冒烟
- [ ] 6.2 手工：A 会话流式中切到 B，确认 A 继续完成且 B 独立
- [ ] 6.3 手工：长对话滚动性能；上下文 N=50 与更小 N 仅影响请求体
- [ ] 6.4 对改动文件跑 lint / 类型检查
