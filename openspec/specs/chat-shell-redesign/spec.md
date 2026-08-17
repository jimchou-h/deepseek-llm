# chat-shell-redesign Specification

## Purpose
TBD - created by archiving change multi-session-chat. Update Purpose after archive.
## Requirements
### Requirement: Three-pane chat shell

The chat experience SHALL present an AI-Native layout with: application navigation, a conversation session list, and a primary message column with a sticky bottom input. The session list and message column SHALL be usable as the main chat workspace.

#### Scenario: Desktop layout

- **WHEN** the user opens chat on a desktop-width viewport
- **THEN** the session list and message pane are both visible without navigating away from chat

#### Scenario: Narrow viewport

- **WHEN** the viewport is narrow
- **THEN** the session list remains reachable (e.g. collapsible rail or drawer) without blocking the message input entirely

### Requirement: DeepSeek blue accent

The chat shell SHALL use DeepSeek blue as the primary accent for selected session state, primary actions, and key interactive highlights, aligned with Ant Design primary (`#1890ff`) unless a documented brand token supersedes it. The palette SHALL avoid purple-on-white AI cliché theming.

#### Scenario: Selected session affordance

- **WHEN** a session is active
- **THEN** it is visually distinguished using the DeepSeek blue accent (or derived token)

### Requirement: Content-first minimal chrome

The redesign SHALL keep chrome minimal: clear hierarchy between session list and messages, readable bubbles, and subtle motion only for streaming/typing feedback. List-level decorative motion SHALL NOT compromise scroll performance.

#### Scenario: Input always available

- **WHEN** the user is viewing the active session
- **THEN** the composer remains reachable at the bottom of the message column

