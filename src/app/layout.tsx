import type { CSSProperties, ReactNode } from 'react';
import type { Metadata } from 'next';
import { Chakra_Petch, IBM_Plex_Mono, Noto_Sans_SC } from 'next/font/google';
import './globals.css';
import '@/styles/antd-overrides.css';
import { AppProviders } from '@/components/layout/app-providers';
import { inkConsoleCssVars } from '@/lib/theme/deepseek';

const display = Chakra_Petch({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const body = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-body',
  display: 'swap',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DeepSeek WebUI',
  description: '基于 DeepSeek 大语言模型的现代化 Web 交互界面',
};

export const revalidate = 3600;

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="zh" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className={body.className} style={inkConsoleCssVars() as CSSProperties}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
