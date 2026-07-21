import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/styles/antd-overrides.css";
import { AppProviders } from "@/components/layout/app-providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DeepSeek WebUI",
  description: "基于 DeepSeek 大语言模型的现代化 Web 交互界面",
};

export const revalidate = 3600; // 1小时重新验证一次

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body className={inter.className}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
