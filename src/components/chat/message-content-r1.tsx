'use client';

import React, { Suspense, memo } from 'react';
import { Spin } from 'antd';


interface MessageContentProps {
  content: string;
}

export const MessageContentR1 = memo(({ content }: MessageContentProps) => {

  return (
    <Suspense fallback={<Spin />}>
      {content}
    </Suspense>
  );
}); 