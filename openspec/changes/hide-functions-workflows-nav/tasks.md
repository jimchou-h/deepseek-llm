## 1. 隐藏侧栏入口

- [ ] 1.1 从主导航移除函数配置与 Coze/workflows 入口，并将设置项 Menu key 改为 `/settings`；同步 `navigation.ts` 可见项（不含 `/functions`、`/workflows`）。涉及：`nav-menu.tsx`、`navigation.ts`（可选抽出纯配置便于测）。验收：侧栏仅见对话/提示词模板/设置；`/settings` 选中正确；纯函数或配置单测断言可见 href 集合不含 functions/workflows。
- [ ] 1.2 确认直链 `/functions`、`/workflows` 仍可打开（不改 RouteGuard、不删页面）。涉及：手动或现有路由冒烟。验收：直链进页不被因「隐藏导航」而重定向到 `/chat`。

## 2. 发布准备

- [ ] 2.1 本 change 相关改动 commit 并 push 到已连接 Vercel 的远程分支，便于预览/生产部署。验收：远程有含导航隐藏的 commit；Vercel 部署成功或给出部署链接（需用户确认 remote/分支策略）。
