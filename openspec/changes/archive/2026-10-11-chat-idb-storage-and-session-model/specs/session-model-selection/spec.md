## ADDED Requirements

### Requirement: Model catalogue limited to pro and flash

系统 SHALL 仅提供两个模型档位：`pro` → `deepseek-v4-pro`、`flash` → `deepseek-v4-flash`。旧的 `chat`、`coder`、`reasoner` 档位 SHALL 被移除，包括其选项与 reasoner 专用校验分支。

#### Scenario: 仅两个可选模型

- **WHEN** 用户打开任意模型选择控件（设置页或聊天工具栏）
- **THEN** 仅有 DeepSeek Pro 与 DeepSeek Flash 两个选项

### Requirement: Per-session model selection

每个会话 SHALL 可携带可选的 `model` 字段，且该字段随会话一同持久化。会话有显式 `model` 时请求 SHALL 使用该模型；否则 SHALL 回落到全局设置中的默认模型。

#### Scenario: 会话独立模型

- **WHEN** 会话 A 选择 flash、会话 B 选择 pro
- **THEN** 在 A 发送的请求使用 `deepseek-v4-flash`，在 B 发送的请求使用 `deepseek-v4-pro`

#### Scenario: 缺省回落全局

- **WHEN** 会话从未被指定模型
- **THEN** 该会话的请求使用全局设置中的默认模型

#### Scenario: 会话模型持久化

- **WHEN** 用户为会话选定模型后刷新页面并回到该会话
- **THEN** 工具栏仍显示该会话此前选定的模型

### Requirement: Session model control in chat toolbar

聊天输入区工具栏 SHALL 提供模型下拉，显示当前会话的生效模型；更改 SHALL 只作用于当前会话，且对下一条发送的消息立即生效。切换会话时下拉 SHALL 反映目标会话的生效模型。

#### Scenario: 会话间切换更新下拉

- **WHEN** 用户从模型为 flash 的会话切到模型为 pro 的会话
- **THEN** 下拉显示值随之变为 pro

### Requirement: Model is passed explicitly to the API layer

`chatCompletion` SHALL 接收显式的模型参数并按所选模型发起请求，MUST NOT 在 API 层写死模型名。

#### Scenario: 请求体携带所选模型

- **WHEN** 会话生效模型为 flash 且用户发送消息
- **THEN** 请求体 `model` 字段为 `deepseek-v4-flash`
