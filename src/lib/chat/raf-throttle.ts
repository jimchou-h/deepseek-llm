export type RafThrottle = ((value: string) => void) & { cancel: () => void };

type FrameCallback = (time: number) => void;

export function createRafThrottle(
  update: (value: string) => void,
  raf: (cb: FrameCallback) => number = requestAnimationFrame,
  caf: (id: number) => void = cancelAnimationFrame
): RafThrottle {
  let pending: string | null = null;
  let frame = 0;

  const push = ((value: string) => {
    pending = value;
    if (frame) return;
    frame = raf(() => {
      frame = 0;
      if (pending !== null) update(pending);
      pending = null;
    });
  }) as RafThrottle;

  push.cancel = () => {
    if (frame) caf(frame);
    frame = 0;
    pending = null;
  };

  return push;
}
