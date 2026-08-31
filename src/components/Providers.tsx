'use client';

import React from 'react';
import { CatalogProvider } from '@/lib/catalog';

export default function Providers({ children }: { children: React.ReactNode }) {
  return <CatalogProvider>{children}</CatalogProvider>;
}
