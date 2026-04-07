import MainLayout from '@/components/layout/main-layout';

export default function MainLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
} 