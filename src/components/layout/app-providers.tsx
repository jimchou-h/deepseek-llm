'use client';

import { ConfigProvider, theme } from 'antd';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { RouteGuard } from '@/components/layout/route-guard';
import { DEEPSEEK_BLUE, INK_CONSOLE } from '@/lib/theme/deepseek';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: DEEPSEEK_BLUE,
            colorBgBase: INK_CONSOLE.ink,
            colorBgLayout: INK_CONSOLE.ink,
            colorBgContainer: INK_CONSOLE.panel,
            colorBgElevated: INK_CONSOLE.deck,
            colorBorder: INK_CONSOLE.line,
            colorBorderSecondary: INK_CONSOLE.line,
            colorText: INK_CONSOLE.text,
            colorTextSecondary: INK_CONSOLE.dim,
            borderRadius: 8,
            fontFamily: 'var(--font-body), "Noto Sans SC", sans-serif',
          },
        }}
      >
        <RouteGuard>{children}</RouteGuard>
      </ConfigProvider>
    </AntdRegistry>
  );
}
