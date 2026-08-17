import { describe, expect, it, vi } from 'vitest';
import { createRafThrottle } from './raf-throttle';

describe('createRafThrottle', () => {
  it('does not flush a pending frame after cancel', () => {
    const update = vi.fn();
    const frames: Array<(time: number) => void> = [];
    const raf = (cb: (time: number) => void) => {
      frames.push(cb);
      return frames.length;
    };
    const caf = vi.fn();
    const push = createRafThrottle(update, raf, caf);

    push('partial');
    push.cancel();
    frames[0](0);

    expect(caf).toHaveBeenCalledWith(1);
    expect(update).not.toHaveBeenCalled();
  });

  it('flushes the latest pending value on the next frame', () => {
    const update = vi.fn();
    const frames: Array<(time: number) => void> = [];
    const raf = (cb: (time: number) => void) => {
      frames.push(cb);
      return frames.length;
    };
    const push = createRafThrottle(update, raf, () => undefined);

    push('a');
    push('b');
    frames[0](0);

    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith('b');
  });
});
