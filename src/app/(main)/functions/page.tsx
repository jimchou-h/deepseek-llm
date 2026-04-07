'use client';

import { Card } from 'antd';
import { FunctionSettings } from '@/components/settings/function-settings';
import styles from '@/styles/layout/page-layout.module.css';

export default function FunctionsPage() {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageContent}>
        <div className={styles.pageHeader}>
          <h1 className="text-2xl font-bold">函数配置</h1>
          <p className="text-gray-500 mt-2">
            配置和管理可供 AI 调用的外部函数
          </p>
        </div>
        <div className={styles.pageBody}>
          <Card bordered={false}>
            <FunctionSettings />
          </Card>
        </div>
      </div>
    </div>
  );
} 