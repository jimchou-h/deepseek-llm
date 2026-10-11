# code-hygiene (delta)

## ADDED Requirements

### Requirement: Lint 门禁可用

`npm run lint` SHALL 可非交互运行且以 0 error 退出；lint SHALL 与 `tsc --noEmit`、`vitest run`、`openspec validate` 并列为每个 change 的验收门禁。

#### Scenario: 干净仓库跑 lint

- WHEN 在无任何代码错误的 master 上执行 `npm run lint`
- THEN 命令 SHALL 正常结束且退出码为 0，无 error 级输出

#### Scenario: 引入违规代码

- WHEN 某次改动引入了 ESLint error 级违规（如未使用变量、无效 hook 依赖）
- THEN `npm run lint` SHALL 以非零退出码失败并指出文件与行号

### Requirement: 仓库不含无引用源文件与闲置依赖

`src/**` 中的每个非测试源文件 SHALL 至少被一个存活调用方引用（直接或经路由入口）；`package.json` 声明的每个运行时/开发依赖 SHALL 在源码或构建配置中有实际使用点。

#### Scenario: 删除死代码后行为不变

- WHEN 删除 `deepseekopenapi.ts`、`coze.ts`、`function-handler.ts`、`function-utils.ts` 与依赖 `framer-motion`、`@types/uuid`
- THEN `tsc --noEmit`、`vitest run`、`npm run lint` SHALL 全部通过，且应用运行行为无任何变化

#### Scenario: 新增模块必须有调用方

- WHEN 新 change 添加一个源文件但没有任何 import 方
- THEN 该 change 的验收 SHALL 判定为不通过（或该文件 SHALL 被删除）
