# Proposal: repo-hygiene-lint-deadcode-style

## Why

仓库当前 lint 门禁完全失效（`eslint.config.mjs` 引用了 `eslint-config-next@14.1.0` 中不存在的 `next/typescript` 共享配置，`npm run lint` 直接报错），且约 17% 的 src 代码（745/4458 行）是无任何调用点的死代码；样式体系 CSS Modules 与 Tailwind 双轨并存却没有成文约定，此前的多个对齐/溢出 bug 都发生在这个模糊地带。

## What Changes

- 修复 ESLint flat config，使 `npm run lint` 可运行、可修，并把 lint 纳入每次变更的验收门禁（与 tsc / vitest / openspec validate 并列）。
- 删除确认无任何引用来源的死代码四件套：`src/lib/api/deepseekopenapi.ts`、`src/lib/api/coze.ts`、`src/lib/api/function-handler.ts`、`src/lib/utils/function-utils.ts`。
- 移除闲置依赖：`framer-motion`（全仓零引用）、`@types/uuid`（uuid v11 自带类型）；保留 `openai`（type-only import 在用）。
- 新建根 `CONTEXT.md`：记录领域术语表与样式双轨使用边界（布局皮肤用 CSS Modules，markdown 渲染区允许 Tailwind 等），补上 `agents.md` 已引用但不存在的文档。

## Capabilities

### New Capabilities

- `code-hygiene`：lint 工具链可用性与验收门禁；仓库不得包含无引用源文件与未使用依赖的清理要求。
- `project-conventions`：根 `CONTEXT.md` 作为领域术语与编码/样式约定的单一文档入口。

### Modified Capabilities

（无——本 change 不改动任何 chat 行为需求的 spec 级语义。）

## Impact

- 配置：`eslint.config.mjs`、`package.json`（devDependencies）。
- 删除：`src/lib/api/deepseekopenapi.ts`（443 行）、`src/lib/api/coze.ts`（176 行）、`src/lib/api/function-handler.ts`（74 行）、`src/lib/utils/function-utils.ts`（52 行）。
- 新增：根 `CONTEXT.md`。
- 验证门禁变化：此后每个 change 的验收清单需包含 `npm run lint` 通过。
- 不影响任何运行时行为：死代码零引用，`tsc + vitest` 必须保持全绿作为回归证据。
