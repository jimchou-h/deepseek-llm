## REMOVED Requirements

### Requirement: Migrate legacy single-thread store

**Reason**: 旧 localStorage 聊天数据被明确丢弃（不迁移），`chat-store` key 在加载时直接清除，flat `messages` 旧格式永无入口。

**Migration**: 无需迁移。升级后首次加载从空会话开始；历史数据不恢复。
