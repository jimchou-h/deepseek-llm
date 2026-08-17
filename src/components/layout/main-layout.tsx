'use client';

import { Layout } from 'antd';
import { NavMenu } from './nav-menu';
import { BalanceDisplay } from './balance-display';
import styles from '@/styles/layout/main-layout.module.css';

const { Sider, Content } = Layout;

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Layout className={styles.shell}>
      <Sider theme="dark" className={styles.sider} width={220}>
        <div className={styles.siderInner}>
          <div className={styles.brand}>
            <h1 className={styles.logo}>DeepSeek</h1>
          </div>
          <div className={styles.nav}>
            <NavMenu />
            <BalanceDisplay />
          </div>
        </div>
      </Sider>
      <Layout className={styles.main}>
        <Content className={styles.content}>{children}</Content>
      </Layout>
    </Layout>
  );
}
