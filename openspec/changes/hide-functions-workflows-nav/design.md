## Context

侧栏 `NavMenu` 目前列出：对话、提示词模板、函数配置、COZE 插件配置、设置。`navigation.ts` 另有一份未完全同步的菜单数据。推 Vercel 前需要收窄公开入口；页面与 API 代码先保留。

本变更简单（单点导航可见性），技术方案以本文件决策为准，实现细节对齐 delta specs。

## Goals / Non-Goals

**Goals:**

- 侧栏不再展示函数配置、Coze 插件配置
- 设置项 Menu key 正确指向 `/settings`
- `navigation.ts` 与侧栏可见项一致（不含函数/workflows）

**Non-Goals:**

- 删除页面、store、API 或 RouteGuard 路由白名单
- 启用/禁用 DeepSeek tools 调用
- 新增功能开关 UI 或环境变量门控（本次硬编码隐藏即可）

## Decisions

### 1. 硬编码从菜单移除，不做 feature flag

- **选择**：直接从 `menuItems` / `navigation` 数组去掉两项。
- **为何不用** env 开关：演示期「先隐藏」足够；加 flag 增加配置面，非本 change 目标。
- **恢复路径**：git revert 或把两项加回数组。

### 2. 保留直链可访问

- **选择**：不改 `route-guard` 的合法路由；手输 `/functions`、`/workflows` 仍可进。
- **为何不用** 重定向到 `/chat`：隐藏入口不等于下线能力，便于维护者调试；公开演示用户几乎不会猜 URL。

### 3. 顺带修设置项 key

- 当前设置项 `key: '/functions'`，会导致函数页与设置页选中态冲突。隐藏函数入口后必须把设置 `key` 改为 `/settings`。

## Risks / Trade-offs

- **[Risk] 书签/旧链接仍进配置页** → 可接受；若演示必须彻底不可见，后续加 redirect task。
- **[Trade-off] 无运行时开关** → 恢复需改代码发版；换取实现极简。

## Migration Plan

1. 合并后 Vercel 自动部署即可生效。
2. 回滚：还原 `nav-menu.tsx` / `navigation.ts`。

## Open Questions

- （无）直链是否保留：proposal 已定为允许。
