# Tasks: chat-idb-storage-and-session-model

## 1. IndexedDB 持久化

- [x] 1.1 新增 `idb-keyval` 依赖与 `idbJsonStorage` 适配器（含 SSR/隐私模式守卫），`chat-store` persist 切到该适配器、version 提为 2，模块加载时清除 localStorage 旧 `chat-store` key；`chat-persist-thrash.repro.test.ts` 改按新存储 stub。涉及层级：storage 模块 → chat-store → 测试。验收：mock idb-keyval 单测覆盖读/写/删与旧 key 清理；chat-store 既有测试全绿；浏览器刷新后会话从 IndexedDB 恢复且 localStorage 无 `chat-store`。

## 2. 水合 gating

- [x] 2.1 新增 `use-chat-hydrated` 钩子（订阅 `persist.hasHydrated`/`onFinishHydration`），`session-rail` 与聊天主区（消息列表+输入区）在水合完成前渲染静态骨架并禁用交互。涉及层级：hook → 两个组件 → chat 页面。验收：硬刷新不出现"先空会话再跳出真实历史"；水合前输入框/新建/删除均不可用，水合后恢复；对应场景对照 chat-storage-persistence spec。

## 3. 模型基础（全局真正生效 + 仅 pro/flash）

- [x] 3.1 `API_CONFIG.MODELS` 重写为 `{ pro: 'deepseek-v4-pro', flash: 'deepseek-v4-flash' }`，删除 `chat/coder/reasoner`；`ChatSettings.model` 类型收紧为 `ModelType`；settings-store 默认 `'pro'`、persist migrate 把旧值映射为 `'pro'`；设置面板下拉改为 Pro/Flash 两档；`chatCompletion` 增加可选 `model` 参数（缺省回落 `settings.model`）、删除 reasoner 校验分支；`deepseekopenapi.ts` 的 `MODELS['chat']` 引用改为按 `settings.model` 取档。涉及层级：config → types → settings-store → settings-panel → API。验收：单测（mock fetch）断言请求体 `model` 与传入档位一致；设置页选 Flash 后请求走 `deepseek-v4-flash`；tsc/vitest 全绿。

## 4. 会话级模型覆盖

- [x] 4.1 `Session` 增加可选 `model` 字段与 `setSessionModel` action；新增 `resolveSessionModel` 纯函数（显式优先、缺省回落全局）；`ChatInput` toolbar 增加模型下拉（显示当前会话生效模型，更改只影响当前会话、下一条消息起生效），发送时经 resolve 后传入 `chatCompletion`。涉及层级：session-utils → chat-store → chat-input → 发送编排。验收：`resolveSessionModel` 单测（显式/回落/切换会话不串）；手动验证 A 会话 Flash、B 会话 Pro 时 Network 请求体 model 各自正确；刷新后各会话选择恢复。

## 5. 省 token

- [ ] 5.1 `DEFAULT_CONTEXT_MESSAGE_LIMIT` 50→20（同步 chat-store 测试断言）；`buildApiMessages` 对超 8000 字符的单条消息截断并加 `[truncated]` 标记（仅出参，不改 store/UI 数据）；请求体固定加 `max_tokens: 8192`。涉及层级：context-window → chat-store 测试 → deepseek API。验收：context-window 单测覆盖新默认值、>8000 截断、≤8000 原样、system 不计条数；mock fetch 断言 `max_tokens`；全量测试绿。
