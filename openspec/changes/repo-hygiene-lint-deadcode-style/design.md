# Design: repo-hygiene-lint-deadcode-style

## Context

- `eslint.config.mjs` 使用 FlatCompat extends `next/core-web-vitals` + `next/typescript`，但锁定的 `eslint-config-next@14.1.0` 没有 `next/typescript`（该共享配置 14.2+ 才引入），且 devDep 是 `eslint@^8`，`npm run lint` / `npx eslint .` 均直接报错。
- 死代码经全仓 import 反查确认零调用方：`deepseekopenapi.ts`、`coze.ts`、`function-handler.ts`（仅被自己引用于 utils）、`function-utils.ts`（仅被 function-handler 引用）。存活的函数相关链路是 `function-tester.ts` ← `function-test-modal.tsx`，不受影响。
- `framer-motion` 全仓零引用；`@types/uuid` 冗余（uuid v11 自带类型）；`openai` 仅 type-only import，保留。
- 样式现状：`src/styles/**` CSS Modules 为主，`message-content.tsx` / `code-block.tsx` 等 markdown 渲染区用 Tailwind 工具类。

## Goals / Non-Goals

**Goals:**
- `npm run lint` 可运行且 0 error，成为与 tsc/vitest 并列的常规验收门禁。
- 删除 4 个死文件与 2 个闲置依赖，运行时行为零变化。
- 根 `CONTEXT.md` 落地：术语表 + 样式双轨边界 + 验证门禁清单。

**Non-Goals:**
- 不升级 next/React 大版本（next@14.1.0 升级另开 change）。
- 不引入 Prettier、不做全仓格式化。
- 不重写样式体系，只成文约定。

## Decisions

1. **lint 修复采用「`.eslintrc.json` 为唯一事实源 + flat 入口委托」**：新增 `.eslintrc.json`（extends 仅 `next/core-web-vitals`，不含 `next/typescript`）；`eslint.config.mjs` 保留但改为读取同一份 `.eslintrc.json` 经 FlatCompat 转换，消除双轨漂移。
   - 理由（实施时修正原方案）：next@14.1 的 `next lint` 只识别 `.eslintrc.*`，无配置时会交互挂起；原计划的「只删 flat config 里的 extends」实测后 `npx eslint .`（flat 目录扫描）对 TSX 覆盖不可靠。`.eslintrc.json` 是 next 14 + eslint 8 的标准组合。
   - 类型层面的问题由 `tsc --strict` 覆盖；不升级 `eslint-config-next`（避免为一个 lint 问题动 next 版本）。
2. **修复后暴露的存量 lint 错误就地修**，不通过 ignore 规则掩盖；确实无法修的用行级 `eslint-disable` 加注释说明。
3. **死代码直接物理删除**（git history 兜底），不留注释或 re-export 兼容层，与用户既有「删干净」偏好一致。
4. **`CONTEXT.md` 放仓库根**（`agents.md`/`docs/agents/domain.md` 已按此路径引用），内容极简：术语、样式边界、门禁清单三节；`docs/adr/` 本次不建（无重大决策需要 ADR）。

## Risks / Trade-offs

- [删 `next/typescript` 后丢失 @typescript-eslint 规则] → `tsc --strict` 已覆盖类型正确性；lint 只守 React/Next 惯例，可接受。
- [存量代码可能暴露较多 lint error，扩大工作量] → 门禁目标是 0 error；若为大尾（>20 处）逐条修，仍不放宽规则。
- [误删非死代码] → 删除前后各跑一次 `tsc + vitest + eslint` 全绿作为回归证据；`function-tester` 链路单独确认未被引用网波及。

## Migration Plan

单 PR 序列：先修 lint（此后才有门禁可用）→ 再删死代码/依赖 → 最后写 CONTEXT.md。回滚即 revert 对应 commit，无数据迁移。
