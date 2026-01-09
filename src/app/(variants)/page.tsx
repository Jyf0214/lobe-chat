import { DynamicLayoutProps } from '@/types/next';

import DesktopRouter from './router';

export default async (_props: DynamicLayoutProps) => {
  return <DesktopRouter />;
};
