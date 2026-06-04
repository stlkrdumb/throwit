'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const DynamicMyUploads = dynamic(
  () => import('@/components/MyUploads').then((m) => m.MyUploads),
  { ssr: false, loading: () => <Skeleton className="h-[200px] w-full rounded-xl" /> }
);

export function MyUploadsWrapper() {
  return <DynamicMyUploads />;
}
