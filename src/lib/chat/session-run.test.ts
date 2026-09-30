import { describe, expect, it, beforeEach } from 'vitest';
import {
  abortSessionRun,
  clearSessionRunIf,
  isCurrentRun,
  resetSessionRunsForTests,
  startSessionRun,
} from './session-run';

describe('session-run generation control', () => {
  beforeEach(() => {
    resetSessionRunsForTests();
  });

  it('marks only the latest run as current after restart', () => {
    const first = startSessionRun('s1');
    const second = startSessionRun('s1');
    expect(isCurrentRun('s1', first.runId)).toBe(false);
    expect(isCurrentRun('s1', second.runId)).toBe(true);
    expect(first.controller.signal.aborted).toBe(true);
  });

  it('abort does not clear current run id (finally owns cleanup)', () => {
    const run = startSessionRun('s1');
    abortSessionRun('s1');
    expect(run.controller.signal.aborted).toBe(true);
    expect(isCurrentRun('s1', run.runId)).toBe(true);
  });

  it('old finally must not clear a newer run', () => {
    const old = startSessionRun('s1');
    const newer = startSessionRun('s1');
    clearSessionRunIf('s1', old.runId);
    expect(isCurrentRun('s1', newer.runId)).toBe(true);
    clearSessionRunIf('s1', newer.runId);
    expect(isCurrentRun('s1', newer.runId)).toBe(false);
  });
});
