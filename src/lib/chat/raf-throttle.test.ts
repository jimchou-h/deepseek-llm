import { describe, expect, it, vi } from 'vitest';
import { createRafThrottle } from './raf-throttle';

describe('createRafThrottle', () => {
  it('does not flush a pending frame after cancel', () => {
    const update = vi.fn();
    let scheduled: FrameRequestCallback | null = null;
    const raf = (cb: FrameRequestCallback) => {
      scheduled = cb;
      return 1;
    };
    const caf = vi.fn();
    const push = createRafThrottle(update, raf, caf);

    push('partial');
    push.cancel();
    scheduled?. (0);

    expect(caf).toHaveBeenCalledWith(1);
    expect(update).not.toHaveBeenCalled();
  });

  it('flushes the latest pending value on the next frame', () => {
    const update = vi.fn();
    let scheduled: FrameRequestCallback | null = null;
    const raf = (cb: FrameRequestCallback) => {
      scheduled = cb;
      return 1;
    };
    const push = createRafThrottle(update, raf, () => undefined);

    push('a');
    push('b');
    scheduled?.(0);

    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith('b');
  });
});
