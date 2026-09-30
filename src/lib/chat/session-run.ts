/**
 * 每个会话同时最多一个「当前 run」。
 * 停止或新开发送时换新 runId，旧 run 的 finally / 迟到 chunk 因校验失败被丢弃。
 */

export type SessionRun = {
  runId: string;
  controller: AbortController;
};

const runsBySessionId = new Map<string, SessionRun>();

function createRunId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `run-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** 开始新 run；若同会话已有旧 run，先 abort（不负责清 UI）。 */
export function startSessionRun(sessionId: string): SessionRun {
  const prev = runsBySessionId.get(sessionId);
  if (prev) {
    prev.controller.abort();
  }
  const run: SessionRun = {
    runId: createRunId(),
    controller: new AbortController(),
  };
  runsBySessionId.set(sessionId, run);
  return run;
}

export function getSessionRun(sessionId: string): SessionRun | undefined {
  return runsBySessionId.get(sessionId);
}

export function isCurrentRun(sessionId: string, runId: string): boolean {
  return runsBySessionId.get(sessionId)?.runId === runId;
}

/** 用户停止：abort 当前 controller，但保留 map 项直到该 run 的 finally 做代际清理。 */
export function abortSessionRun(sessionId: string): void {
  const run = runsBySessionId.get(sessionId);
  run?.controller.abort();
}

/** 仅当仍是当前 run 时移除登记（由 owning finally 调用）。 */
export function clearSessionRunIf(sessionId: string, runId: string): void {
  const current = runsBySessionId.get(sessionId);
  if (current?.runId === runId) {
    runsBySessionId.delete(sessionId);
  }
}

/** 测试用：清空全部 run 登记 */
export function resetSessionRunsForTests(): void {
  runsBySessionId.clear();
}
