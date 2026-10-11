'use client';

import { useSyncExternalStore } from 'react';
import { useChatStore } from '@/lib/store/chat-store';

// IndexedDB 水合是异步的：完成前 UI 必须处于骨架/禁用态，防止操作被迟到的水合覆盖
export function useChatHydrated(): boolean {
  return useSyncExternalStore(
    (onChange) => useChatStore.persist.onFinishHydration(onChange),
    () => useChatStore.persist.hasHydrated(),
    () => false
  );
}
