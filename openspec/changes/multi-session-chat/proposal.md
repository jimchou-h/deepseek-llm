## Why

当前对话是单一全局 `messages[]`：无法并行维护多段聊天；消息一多时 `ChatWindow` 全量 DOM + framer-motion 会明显卡顿；发给模型的上下文也是「整段历史」，无法控制成本与 token。需要一次把多会话、消息虚拟列表、可配置上下文窗口做成可用的 Chat 体验，并用 AI-Native 布局 + DeepSeek 蓝做轻量 redesign。

## What Changes

- 支持多个本地会话：新建、切换、删除；标题由首条用户消息截断生成；允许在流式生成中切换会话，原会话流式继续写回且不受影响
- 消息气泡列表改为虚拟列表（动态高度），去掉列表层重动画，缓解长对话卡顿
- 全局可配置「发送上下文条数」，默认 50：请求只带 system（若有）+ 当前会话消息列表最近 N 条（与 UI 同源列表）
- Chat 页壳重新设计：App 导航 | 会话列表 | 消息区 + 底栏输入；强调色使用 DeepSeek 蓝（沿用/对齐 Ant Design primary `#1890ff`）
- 迁移：现有 `chat-store` 单会话消息升为「默认会话」，避免丢历史

## Capabilities

### New Capabilities

- `multi-session-chat`: 多会话生命周期、按会话隔离的消息与流式状态、会话标题与切换行为
- `chat-message-virtualization`: 消息气泡列表虚拟化与滚动/流式交互约束
- `chat-context-window`: 全局上下文条数配置及发送时截取规则
- `chat-shell-redesign`: Chat 三栏壳与 DeepSeek 蓝主题的视觉/布局要求

### Modified Capabilities

- （无）`openspec/specs/` 尚无既有 capability

## Impact

- **Store**: `src/lib/store/chat-store.ts`（及可能的 settings 字段）结构变更与 persist 迁移
- **UI**: `chat-window.tsx`、`chat-input.tsx`、`chat/page.tsx`、layout/侧栏；新增会话列表组件
- **发送路径**: `chat-input` 组装 `messageList` 时 `slice(-N)`
- **依赖**: 新增虚拟列表库（如 `react-virtuoso` 或 `@tanstack/react-virtual`）
- **设置页**: 增加「发送上下文条数」全局配置项
- **非目标**: 服务端同步会话、按 token 计费窗口、会话列表虚拟化、模型自动起标题
