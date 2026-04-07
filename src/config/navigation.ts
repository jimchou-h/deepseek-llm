import {
  MessageOutlined,
  SettingOutlined,
  FunctionOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { ComponentType } from 'react';

interface NavigationItem {
  name: string;
  href: string;
  icon: ComponentType;
}

export const navigation: NavigationItem[] = [
  {
    name: '对话',
    href: '/',
    icon: MessageOutlined,
  },
  {
    name: '函数配置',
    href: '/functions',
    icon: FunctionOutlined,
  },
  {
    name: '设置',
    href: '/settings',
    icon: SettingOutlined,
  },
]; 