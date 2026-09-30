'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSettingsStore } from '@/lib/store/settings-store';
import { isAppRoute, PUBLIC_PATHS } from '@/config/app-routes';

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { apiKey } = useSettingsStore();
  const [isStoreLoaded, setIsStoreLoaded] = useState(false);

  useEffect(() => {
    // 确保 store 已经从 localStorage 加载完成
    setIsStoreLoaded(true);
  }, []);

  useEffect(() => {
    if (!isStoreLoaded) return;

    if (pathname === '/') {
      router.replace('/chat');
      return;
    }

    if (!isAppRoute(pathname)) {
      router.replace('/chat');
      return;
    }

    if (!apiKey && !(PUBLIC_PATHS as readonly string[]).includes(pathname)) {
      router.push('/settings');
    }
  }, [pathname, router, apiKey, isStoreLoaded]);

  if (!isStoreLoaded) {
    return null; // 或者返回一个加载指示器
  }

  return <>{children}</>;
}
