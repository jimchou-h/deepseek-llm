import type { CSSProperties, ReactNode } from 'react';
import type { Metadata } from 'next';
import './globals.css';
import '@/styles/antd-overrides.css';
import { AppProviders } from '@/components/layout/app-providers';
import { inkConsoleCssVars } from '@/lib/theme/deepseek';

export const metadata: Metadata = {
  title: 'DeepSeek WebUI',
  description: '基于 DeepSeek 大语言模型的现代化 Web 交互界面',
};

export const revalidate = 3600;

/**
 * 不使用 next/font/google：本地若无法访问 Google Fonts，
 * Next 会在拉取字体重试时卡住/刷 AbortError，导致页面打不开。
 * 字体栈在 globals.css 的 --font-* 变量中定义。
 */
export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="zh">
      <body style={inkConsoleCssVars() as CSSProperties}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
