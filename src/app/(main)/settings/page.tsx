'use client';

import { Card, Tabs } from 'antd';
import { SettingsPanel } from '@/components/settings/settings-panel';
import { ApiSettings } from '@/components/settings/api-settings';
import { FunctionSettings } from '@/components/settings/function-settings';
import { UserOutlined, ApiOutlined, ToolOutlined, FunctionOutlined } from '@ant-design/icons';
import styles from '@/styles/layout/page-layout.module.css';

const items = [
  {
    key: 'api',
    label: 'API 设置',
    icon: <ApiOutlined />,
    children: <ApiSettings />,
  },
  {
    key: 'model',
    label: '模型设置',
    icon: <ToolOutlined />,
    children: <SettingsPanel />,
  },
  {
    key: 'account',
    label: '账号设置',
    icon: <UserOutlined />,
    children: <div>账号设置内容</div>,
  },
];

export default function SettingsPage() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageContent}>
        <div className={styles.pageHeader}>
          <h1 className="text-2xl font-bold">设置</h1>
        </div>
        <div className={styles.pageBody}>
          <Card bordered={false}>
            <Tabs
              defaultActiveKey="api"
              items={items}
              tabPosition="left"
            />
          </Card>
        </div>
      </div>
    </div>
  );
} 