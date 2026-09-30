import {
  MessageOutlined,
  SettingOutlined,
  BookOutlined,
} from '@ant-design/icons';
import { ComponentType } from 'react';

export interface NavigationItem {
  name: string;
  href: string;
  icon: ComponentType;
}

/** 侧栏可见的主导航项（不含实验性 functions / workflows）。 */
export const navigation: NavigationItem[] = [
  {
    name: '对话',
    href: '/chat',
    icon: MessageOutlined,
  },
  {
    name: '提示词模板',
    href: '/templates',
    icon: BookOutlined,
  },
  {
    name: '设置',
    href: '/settings',
    icon: SettingOutlined,
  },
];

export function getVisibleNavHrefs(): string[] {
  return navigation.map((item) => item.href);
}
