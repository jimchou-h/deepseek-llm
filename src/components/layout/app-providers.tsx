'use client';

import { ConfigProvider } from 'antd';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { RouteGuard } from '@/components/layout/route-guard';

import { DEEPSEEK_BLUE } from '@/lib/theme/deepseek';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: DEEPSEEK_BLUE,
            borderRadius: 8,
          },
        }}
      >
        <RouteGuard>{children}</RouteGuard>
      </ConfigProvider>
    </AntdRegistry>
  );
}
