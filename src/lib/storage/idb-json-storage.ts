import { get, set, del } from 'idb-keyval';
import type { StateStorage } from 'zustand/middleware';

// 隐私模式/SSR 下 indexedDB 不存在：读返回 null、写静默跳过（功能可用但不持久）
const hasIdb = () => typeof indexedDB !== 'undefined';

export const idbJsonStorage: StateStorage = {
  getItem: async (name) => (hasIdb() ? ((await get(name)) ?? null) : null),
  setItem: async (name, value) => {
    if (hasIdb()) await set(name, value);
  },
  removeItem: async (name) => {
    if (hasIdb()) await del(name);
  },
};
