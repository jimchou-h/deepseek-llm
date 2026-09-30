## ADDED Requirements

### Requirement: Hide functions and Coze nav entries

The system SHALL NOT display primary navigation links to the functions configuration page or the Coze workflow/plugin configuration page. The chat, prompt templates, and settings entries SHALL remain visible.

#### Scenario: Sidebar omits functions and Coze

- **WHEN** the user views the main application sidebar
- **THEN** the navigation MUST NOT show labels or links for 函数配置 / functions or COZE/Coze 插件配置 / workflows
- **AND** the navigation MUST still show entries for 对话、提示词模板、and 设置

#### Scenario: Settings selection key is correct

- **WHEN** the user is on `/settings`
- **THEN** the settings navigation item SHALL be the selected menu item
- **AND** its menu key SHALL correspond to `/settings` (not `/functions`)

### Requirement: Config pages remain reachable by URL

The system SHALL keep the `/functions` and `/workflows` routes available when navigated to directly (typed URL or bookmark). Hiding nav entries MUST NOT remove or redirect these routes as part of this change.

#### Scenario: Direct URL still works

- **WHEN** the user navigates directly to `/functions` or `/workflows`
- **THEN** the corresponding page SHALL render (subject to existing route guard / API key rules)
- **AND** the system MUST NOT redirect solely because the nav entry is hidden
