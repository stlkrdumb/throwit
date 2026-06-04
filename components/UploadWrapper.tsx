'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const DynamicUploadCard = dynamic(
  () => import('@/components/UploadCard').then((m) => m.UploadCard),
  { ssr: false, loading: () => <Skeleton className="h-[320px] w-full rounded-xl" /> }
);

export function UploadWrapper() {
  return <DynamicUploadCard />;
}
