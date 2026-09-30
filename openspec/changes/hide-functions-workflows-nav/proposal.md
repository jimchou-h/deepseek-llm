## Why

即将把当前 WebUI 推到 Vercel 做公开演示。函数配置与 Coze 插件配置仍偏实验/半残（主对话路径未真正启用 tools，且信息架构与侧栏不一致），不宜作为首屏入口暴露给访客。「先隐藏」可快速收窄产品表面，又不删除能力代码，便于日后恢复。

## What Changes

- 从主导航（侧栏）移除「函数配置」与「COZE 插件配置」入口
- 同步清理 `src/config/navigation.ts` 中对应项（若仍列出函数配置）
- 路由页面 `/functions`、`/workflows` 与相关 store/API **保留**；本 change 不做删除、不做功能下线
- 直链访问上述路径：仍允许（便于内部调试）；不强制重定向
- 修复侧栏「设置」项误用 `/functions` 作为 Menu `key` 的既有缺陷（隐藏两项时一并纠正，避免选中态错乱）

## Capabilities

### New Capabilities

- `nav-feature-visibility`: 主导航可见入口的控制——哪些配置类页面出现在侧栏

### Modified Capabilities

- （无）现有 chat/shell specs 不描述侧栏菜单项清单；本次为导航可见性能力，不改多会话/流式等需求

## Impact

- **UI**: `src/components/layout/nav-menu.tsx`、`src/config/navigation.ts`
- **非目标**: 删除 functions/workflows 页面、API、settings 内函数 CRUD、RouteGuard 合法路由列表；不改 DeepSeek tools 启用逻辑
- **发布**: 实现并验收后 commit/push，由既有 Vercel 连接部署（本 change 不新增 Vercel 配置）
