'use client';

import { createElement } from 'react';
import { Menu } from 'antd';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navigation } from '@/config/navigation';
import styles from '@/styles/layout/nav-menu.module.css';

const menuItems = navigation.map((item) => ({
  key: item.href,
  icon: createElement(item.icon),
  label: <Link href={item.href}>{item.name}</Link>,
}));

export function NavMenu() {
  const pathname = usePathname();
  const selectedKey =
    menuItems.find((item) => pathname.startsWith(item.key))?.key || pathname;

  return (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[selectedKey]}
      items={menuItems}
      className={styles.menu}
    />
  );
}
