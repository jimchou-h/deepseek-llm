'use client';

import { Breadcrumb } from 'antd';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeOutlined } from '@ant-design/icons';
import styles from '@/styles/layout/breadcrumb.module.css';

const routeMap: Record<string, string> = {
  chat: '对话',
  templates: '提示词模板',
  settings: '设置'
};

export function PageBreadcrumb() {
  const pathname = usePathname();
  const paths = pathname.split('/').filter(Boolean);

  // 如果是根路径或主路由，只显示当前页面
  if (paths.length <= 1) {
    return (
      <nav className={styles.breadcrumb}>
        <Breadcrumb>
          <Breadcrumb.Item>
            <span className={styles.current}>
              <HomeOutlined /> {routeMap[paths[0]] || '首页'}
            </span>
          </Breadcrumb.Item>
        </Breadcrumb>
      </nav>
    );
  }

  return (
    <nav className={styles.breadcrumb}>
      <Breadcrumb>
        <Breadcrumb.Item>
          <Link href="/chat" className={styles.link}>
            <HomeOutlined /> 首页
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <span className={styles.current}>
            {routeMap[paths[paths.length - 1]] || paths[paths.length - 1]}
          </span>
        </Breadcrumb.Item>
      </Breadcrumb>
    </nav>
  );
} 