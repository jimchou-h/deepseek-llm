## Context

DeepSeek WebUI 是 Next.js 14 + Ant Design + Zustand（persist）的本地 Chat 客户端。对话状态集中在 `chat-store`：单一 `messages[]`、全局 `isLoading` / streaming 字段。`ChatWindow` 对全部消息做 `map` + `AnimatePresence`/`layout`；发送时把全部历史塞进 `chatCompletion`。用户需要多会话、长列表性能、可控上下文，并愿意用 AI-Native 三栏壳 + DeepSeek 蓝做轻量 redesign。

约束：继续本地 persist（无服务端会话）；保留现有 API Key / 模型 / function 设置；流式中可切会话且原流不中断。

## Goals / Non-Goals

**Goals:**

- 多会话 CRUD + 活跃会话；流式状态按 session 隔离
- 消息列表虚拟化，长对话下 DOM 节点受控
- 全局 `contextMessageLimit`（默认 50）控制请求消息条数
- Chat 页：导航 | 会话列表 | 虚拟化消息区 + 底栏输入；主题强调色 DeepSeek 蓝（`#1890ff` / Ant Design primary）
- 平滑迁移旧 `chat-store` 数据

**Non-Goals:**

- 云端同步、多设备
- 按 token 截断或计费估算
- 会话侧栏虚拟化
- LLM 自动起标题、分支对话、分享链接

## Decisions

### 1. 数据模型：sessions 数组（方案 A）

```ts
Session {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
  // 流式进行中的临时态可挂在 session 或旁路 map
}
ChatState {
  sessions: Session[]
  activeSessionId: string | null
  contextMessageLimit: number  // default 50；也可放 settings-store
  // streamingBySessionId / loadingBySessionId
}
```

- **为何不用**「索引 + messagesById」：个人 localStorage 场景下 sessions 数组更简单，与 `workflow-store` 一致；真膨胀再拆。
- **persist**：`partialize` 持久化 sessions、activeSessionId、contextMessageLimit；streaming/loading 可不持久化或仅持久化已落盘消息。

### 2. 流式按 session 隔离

- 发送时捕获 `sessionId`；`onStream` / 完成 / 错误只更新该 id。
- UI 的 loading：仅当 `activeSessionId === streamingSessionId` 时锁输入 / 显示流式气泡；其他会话可照常发（若需限制「全局同时一个请求」可另加，默认允许多会话并行流，但实现可先做「每会话至多一个进行中请求」）。
- **切会话**：立即切换 `activeSessionId`；后台流继续写原 session。

### 3. 虚拟列表：`react-virtuoso`

- 气泡高度动态（markdown / 代码 / reasoning）；Virtuoso 对 chat 底部贴靠、`followOutput` 支持成熟。
- **去掉**消息列表上的 `AnimatePresence` + `layout`；新消息最多轻量 CSS fade。
- 用户上翻离开底部 → 暂停自动跟随；靠近底部再恢复。

### 4. 上下文窗口

- `contextMessageLimit` 全局，设置页可改，默认 `50`，最小 `1`。
- 发送：`[system?] + active.messages.slice(-limit)`（含刚加入的 user，注意与 store 更新时序：用组装后的数组再 slice，或 slice 历史再 concat user）。
- system 不计入 N（与探索结论一致）。
- 不做 reasoner 特殊对齐的复杂逻辑于本 change 强制范围；若 slice 后违反交替规则，可在实现时做「若首条为 assistant 则丢掉直到 user」的最小修正（记为实现细节）。

### 5. 标题

- 空会话：`新对话`
- 首条 user 发出后：取 content 去空白，截断约 30 字（或按字符）+ 省略号；用户未要求重命名 UI 时可后续加，本 change 至少支持自动标题。

### 6. UI 壳

```
[ App Sider 220px ] [ Session rail ~240–280px ] [ Message column flex ]
```

- 窄屏：会话轨改为 Drawer / 可折叠。
- 配色：中性灰底 + DeepSeek 蓝强调（选中会话、主按钮、链接）；字体可用 Plus Jakarta Sans 或保持现有栈，避免 Inter/紫白套路。
- Ant Design `ConfigProvider` token 对齐 primary。

### 7. 依赖

- 新增 `react-virtuoso`（首选）或 `@tanstack/react-virtual`。
- 不强制引入 GSAP。

## Risks / Trade-offs

- **[Risk] localStorage 配额** → sessions 消息过多时写入失败 → 捕获 persist 错误并提示；必要时只留最近 K 会话（本 change 可不做硬上限，但文档提醒）。
- **[Risk] 虚拟列表 + 流式高度变化抖动** → Virtuoso 的 `followOutput` + 稳定 key（timestamp/id）；避免每 token 重建整列表。
- **[Risk] 迁移破坏旧数据** → versioned migrate：若检测到旧 shape（顶层 `messages`），包进默认 session。
- **[Risk] 并行多会话多请求打满 API** → 每会话一请求；可选全局队列（非目标，可后续）。
- **[Trade-off] 截断上下文用户不知情** → 设置项说明文案；可选轻提示「本次发送最近 N 条」（本 change 至少设置页说明）。

## Migration Plan

1. 读取旧 persist `chat-store`：若存在顶层 `messages` 且无 `sessions`，创建 `sessions: [{ id, title, messages, ... }]`，`activeSessionId` 指向它。
2. 写入新 shape 后旧字段不再读取。
3. 回滚：git revert；用户浏览器 localStorage 可能已是新 shape——若需兼容回滚，保留一次性反向 migrate（可选，非必须）。

## Open Questions

- （已关闭）强调色、流式切会话、标题策略。
- 实现时确认：是否允许**同一时刻多个会话同时流式**（设计倾向允许，每会话一个）。若产品要「全局只能一个进行中」，在 tasks 里收窄即可。
