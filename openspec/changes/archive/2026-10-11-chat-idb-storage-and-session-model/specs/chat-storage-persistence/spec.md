## ADDED Requirements

### Requirement: Chat store persists to IndexedDB

系统 SHALL 将 chat store（sessions、activeSessionId、contextMessageLimit）持久化到 IndexedDB（经 `idb-keyval` 的异步 storage 适配器），不再写入 localStorage。settings / template / workflow store SHALL 继续使用 localStorage 同步持久化，不受影响。

#### Scenario: 对话历史落入 IndexedDB

- **WHEN** 用户在会话中发送并收到消息后刷新页面
- **THEN** 会话与消息从 IndexedDB 恢复，localStorage 中不存在 `chat-store` 数据

#### Scenario: 突破 localStorage 容量上限

- **WHEN** 聊天历史的序列化体积超过 localStorage 约 5MB 的配额
- **THEN** 持久化仍然成功，不出现配额写入失败

### Requirement: Legacy localStorage chat data is discarded

系统 SHALL 在 chat store 初始化时检测并删除 localStorage 中的旧 `chat-store` key，不迁移其内容；删除后以 IndexedDB 中已有数据（可能为空）为准。

#### Scenario: 首次在新版本加载

- **WHEN** 用户升级后首次打开应用，且 localStorage 存在旧 `chat-store`、IndexedDB 为空
- **THEN** 旧 key 被删除，应用以空会话列表启动，不报错

### Requirement: Chat UI gates on async hydration

因 IndexedDB 读取为异步，系统 SHALL 在 chat store 完成水合（hydrated）之前，对会话列表与聊天主区渲染不可交互的静态骨架；水合完成前 SHALL 禁止创建/切换/删除会话与发送消息，避免迟到的水合结果覆盖用户操作。

#### Scenario: 水合完成前禁止交互

- **WHEN** 页面已渲染但 chat store 尚未完成 IndexedDB 水合
- **THEN** 聊天区显示骨架，输入框与操作按钮不可用

#### Scenario: 水合完成后正常渲染

- **WHEN** chat store 水合完成
- **THEN** 骨架消失，会话列表与消息区以持久化数据渲染，交互恢复
