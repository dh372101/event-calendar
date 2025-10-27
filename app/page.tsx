'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StorageUtil } from '@/utils/storage';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 重定向到日历页面
    router.replace('/calendar');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin text-4xl mb-4">📅</div>
        <p className="text-gray-600">正在加载演出日历...</p>
      </div>
    </div>
  );
}