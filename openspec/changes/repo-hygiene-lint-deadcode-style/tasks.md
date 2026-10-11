# Tasks: repo-hygiene-lint-deadcode-style

每个 task 为可独立验收的竖切。验收门禁统一为：`npm run lint` + `npx tsc --noEmit` + `npx vitest run` 全绿（3.1 另加 `openspec validate --strict`）。

## 1. Lint 门禁可用

- [x] 1.1 修复 ESLint 使 `npm run lint` 端到端可用。实施修正：next@14.1 的 `next lint` 只读 `.eslintrc.*`，故以新增 `.eslintrc.json`（extends 仅 `next/core-web-vitals`）为事实源，`eslint.config.mjs` 改为经 FlatCompat 委托同一份 `.eslintrc.json`；移除坏的 `next/typescript` extends；逐条修复暴露的 2 个 display-name + 3 个 exhaustive-deps。端到端目标：master 上 `npm run lint` 退出码 0 且 tsc/vitest 不受影响。

## 2. 死代码与闲置依赖清理

- [ ] 2.1 删除确认零引用的 `src/lib/api/deepseekopenapi.ts`、`src/lib/api/coze.ts`、`src/components/chat/message-content-r1.tsx` 与 `config.ts` 的 `BASE_COZE_URL`，删除 devDependencies `framer-motion`、`@types/uuid`（保留 `openai`：type-only 在用），重装依赖刷新 lockfile。**保留** `function-handler.ts`/`function-utils.ts`（复核在 `function-tester ← function-test-modal` 活跃链路上）。端到端目标：删除后三大门禁全绿、functions 页编译与测试不受波及、应用行为零变化。涉及：`src/lib/api/**`、`src/components/chat/**`、`package.json`、lockfile。

## 3. CONTEXT.md 约定落地

- [ ] 3.1 新建根 `CONTEXT.md`，含三节：领域术语表（会话、会话级模型覆盖、上下文窗口、水合等既有概念）、样式使用边界（布局/皮肤 = CSS Modules；markdown 渲染区 = 允许 Tailwind；同一职责不混用）、验证门禁清单（lint + tsc + vitest + openspec validate）。端到端目标：按 project-conventions spec 两个 Scenario 走查——「工具栏样式改哪」「代码块样式用什么」均可在文内一步得到答案。涉及：根 `CONTEXT.md`。
