'use client';

import { Card } from 'antd';
import { WorkflowSettings } from '@/components/settings/workflow-settings';
import styles from '@/styles/layout/page-layout.module.css';

export default function WorkflowsPage() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageContent}>
        <div className={styles.pageHeader}>
          <h1 className="text-2xl font-bold">Coze 工作流</h1>
          <p className="text-gray-500 mt-2">
            配置和管理 Coze 工作流插件
          </p>
        </div>
        <div className={styles.pageBody}>
          <Card bordered={false}>
            <WorkflowSettings />
          </Card>
        </div>
      </div>
    </div>
  );
} 