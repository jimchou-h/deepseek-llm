# Design: chat-idb-storage-and-session-model

复杂点在于异步存储改变 hydration 时序、模型链路贯穿 store/UI/API 三层，故本 change 需要 design。

## 1. 存储：chat-store → IndexedDB

### 1.1 适配器

新增 `src/lib/storage/idb-json-storage.ts`：

```ts
import { get, set, del } from 'idb-keyval';
import type { StateStorage } from 'zustand/middleware';

// zustand persist 的 createJSONStorage 接受异步 StateStorage
export const idbJsonStorage: StateStorage = {
  getItem: async (name) => {
    if (typeof indexedDB === 'undefined') return null; // SSR / 隐私模式兜底
    const value = await get(name);
    return value ?? null; // idb-keyval 返回 any；persist 期望字符串 JSON
  },
  setItem: async (name, value) => { if (typeof indexedDB !== 'undefined') await set(name, value); },
  removeItem: async (name) => { if (typeof indexedDB !== 'undefined') await del(name); },
};
```

`chat-store` persist options 改为 `storage: createJSONStorage(() => idbJsonStorage)`，`version` 提到 2，`migrate` 简化为"空态直落"（旧数据不迁移）。

### 1.2 旧数据清理

模块加载时（仅浏览器侧）执行 `localStorage.removeItem('chat-store')`。放在 store 文件顶层、以 `typeof window !== 'undefined'` 守卫。目的：立刻释放配额；语义与"丢弃旧数据"一致。

### 1.3 水合 gating

zustand v4 persist 提供 `store.persist.hasHydrated()` / `onFinishHydration()`。新增 `src/hooks/use-chat-hydrated.ts` 订阅并返回 boolean。消费方：

- `session-rail.tsx`：未水合 → 渲染 3~4 个固定高度的灰条骨架；不渲染按钮以外的可交互项（"新建"禁用）
- chat 主区（消息列表 + `ChatInput`）：未水合 → 消息区骨架 + 输入框 `disabled`

不使用 `skipHydration`，保持默认自动水合；gating 只影响渲染，不改数据流。

### 1.4 测试

- storage 适配器：mock `idb-keyval` 三函数，断言 getItem/setItem/removeItem 透传与 SSR 守卫
- `chat-persist-thrash.repro.test.ts`：现依赖 stub localStorage 验证"流式更新不触发 chat-store 重写"。chat-store 迁走后该测试语义仍成立（streaming store 独立、不落盘），改为 stub idb-keyval mock 计数即可保留其回归价值

## 2. 模型链路

### 2.1 档位与类型

`API_CONFIG.MODELS = { pro: 'deepseek-v4-pro', flash: 'deepseek-v4-flash' }`；`ModelType = 'pro' | 'flash'`。`ChatSettings.model` 类型收紧为 `ModelType`，settings-store `defaultSettings.model = 'pro'`，persist `migrate`：旧值 `'chat' | 'coder' | 'reasoner'` → `'pro'`。

### 2.2 会话字段与解析

`Session` 增加 `model?: ModelType`（session-utils）。纯函数：

```ts
resolveSessionModel(sessionModel: ModelType | undefined, globalModel: ModelType): ModelType
```

放置于 `src/lib/chat/session-model.ts`（与 UI 解耦、可单测）。chat-store 增加 action `setSessionModel(sessionId, model)`。

### 2.3 UI

`ChatInput` toolbar 左侧（`TemplateSelector` 旁）加 antd `Select`（Pro/Flash），value 为生效模型，onChange 调 `setSessionModel(activeSessionId, m)`。`sendMessage` 用 `resolveSessionModel` 算出模型字符串传入 `chatCompletion`。

### 2.4 API 层

`chatCompletion(messages, settings, apiKey, onStream?, onStreamReasoning?, signal?, model?)` — 参数追加可选 `model: ModelType`（缺省回落 `settings.model`）；请求体 `model: API_CONFIG.MODELS[生效档位]`、`max_tokens: 8192`。删除 reasoner 专用校验分支（v4 两档均无"消息交替"限制）。`deepseekopenapi.ts` 中 `MODELS['chat']` 引用改为按 `settings.model` 取档（该文件为函数/工作流旧路径，最小修复不做重构）。

## 3. 省 token

`DEFAULT_CONTEXT_MESSAGE_LIMIT = 20`。`buildApiMessages` 内对每条消息 `content.length > 8000` 时截断为前 8000 字符 + `'\n…[truncated]'`；仅作用于出参副本，不改 store 数据。

## 4. 风险

- **IndexedDB 不可用（隐私模式）**：SSR 守卫返回 null → 空态启动，写盘静默失败，功能可用但不持久 —— 接受，demo 场景
- **水合前 store 为默认空会话**：gating 挡住交互，无覆盖风险
- **旧 `'chat'` 模型值**：settings migrate 兜底；未迁移路径最坏是请求 404，提示后用户可重选
