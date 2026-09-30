/** 应用内合法路由前缀（含侧栏已隐藏但仍可直链访问的页面）。 */
export const APP_ROUTE_PREFIXES = [
  '/chat',
  '/templates',
  '/settings',
  '/workflows',
  '/functions',
] as const;

export type AppRoutePrefix = (typeof APP_ROUTE_PREFIXES)[number];

export const PUBLIC_PATHS = ['/settings', '/functions', '/workflows'] as const;

export function isAppRoute(path: string): boolean {
  return APP_ROUTE_PREFIXES.some((route) => path.startsWith(route));
}
