# project-conventions (delta)

## ADDED Requirements

### Requirement: 根 CONTEXT.md 是约定与术语的单一文档入口

仓库根 SHALL 存在 `CONTEXT.md`，至少包含三节：领域术语表、样式使用边界、验证门禁清单；其与 `agents.md`/`docs/agents/domain.md` 的引用路径 SHALL 一致。

#### Scenario: 新会话查约定

- WHEN 开发者或 agent 需要确认样式该写 CSS Module 还是 Tailwind 工具类
- THEN `CONTEXT.md` 的「样式使用边界」一节 SHALL 给出可直接执行的判定规则

#### Scenario: 引入新领域术语

- WHEN 某个 change 引入新的领域概念（如「会话级模型覆盖」）
- THEN 该 change 归档前 SHALL 将术语补入 `CONTEXT.md` 术语表

### Requirement: 样式双轨边界

聊天布局、页面骨架与皮肤 SHALL 使用 `src/styles/**` 下的 CSS Modules；markdown 消息渲染区 SHALL 允许使用 Tailwind 工具类；同一段样式 SHALL 不混用两种体系表达同一职责。

#### Scenario: 改聊天工具栏样式

- WHEN 一个改动调整 chat-input 工具栏的高度、间距或配色
- THEN 样式 SHALL 写在对应的 `src/styles/chat/*.module.css` 中，而非组件内 Tailwind 类

#### Scenario: 改 markdown 代码块外观

- WHEN 一个改动调整消息正文中代码块/行内代码的展示
- THEN 使用 Tailwind 工具类 SHALL 视为合规
