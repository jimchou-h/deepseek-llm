# Proposal: chat-idb-storage-and-session-model

## Why

1. 聊天记录（全部会话与消息）经 zustand persist 写入 localStorage，容量上限约 5MB，重度使用后已触顶写入失败。消息历史是唯一会持续膨胀的大对象，应迁移到容量充裕（数百 MB 级）的 IndexedDB。
2. 模型只能全局设置，无法做到"这个会话用 flash、那个会话用 pro"。且 API 层写死 `MODELS.chat`，设置页的模型选项实际不生效，属于断线缺陷。
3. 每次请求把最近 50 条消息全量发送、单条消息不限长度、输出不设上限，token 消耗偏大。

## What Changes

- `chat-store` 的 persist 后端从 localStorage 换成 IndexedDB（新增依赖 `idb-keyval`）；**不迁移旧数据**，启动时直接清除 localStorage 中的 `chat-store` 旧 key
- 因 IndexedDB 读取是异步的，会话列表与聊天主区在水合完成前渲染骨架、禁止交互，防止用户操作被迟到的水合结果覆盖
- 模型档位收敛为两档：`pro → deepseek-v4-pro`、`flash → deepseek-v4-flash`；删除 `chat/coder/reasoner` 及其专用校验、设置页旧选项
- `Session` 增加可选 `model` 字段：会话级模型优先，缺省回落全局设置（全局语义变为"新对话默认模型"）；聊天输入区 toolbar 增加模型下拉，即时生效于当前会话
- 修复断线：`chatCompletion` 显式接收模型参数，不再写死
- 省 token：上下文消息条数默认 50 → 20；单条消息超 8000 字符截断并标注；请求体增加 `max_tokens: 8192`

## Non-goals（非目标）

- 不迁移/兼容旧 localStorage 聊天数据（直接丢弃）
- `settings/template/workflow` store 保持 localStorage，不迁移
- 不做消息级"由哪个模型生成"溯源标注
- 不做历史摘要压缩
- 不处理"删除会话时滚动条闪现"（当前无法稳定复现，移出范围）

## Capabilities

### New Capabilities

- `chat-storage-persistence`: chat-store 的 IndexedDB 持久化、旧数据清理、异步水合与 UI gating
- `per-session-model`: 模型档位定义（pro/flash）、会话级模型覆盖与生效规则

### Modified Capabilities

- `chat-context-window`: 默认条数上限改为 20；新增单条消息长度截断与输出 `max_tokens` 上限

## Impact

- **依赖**: 新增 `idb-keyval`
- **存储**: `src/lib/store/chat-store.ts`、新增 storage 适配模块、`chat-persist-thrash.repro.test.ts` 改造
- **UI**: `chat-input.tsx`（模型下拉、gating）、`session-rail.tsx`（gating）、`settings-panel.tsx`（模型选项换为 pro/flash）、chat 页面壳层
- **API**: `src/lib/api/config.ts`、`deepseek.ts`（model 参数 + max_tokens）、`deepseekopenapi.ts`（引用更新）
- **类型/迁移**: `types/index.ts`（`ChatSettings.model`）、`settings-store` persist migrate
- **测试**: context-window 截断/默认值、storage 适配（mock idb-keyval）、resolveSessionModel、请求体断言
