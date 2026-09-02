'use client';

import React from 'react';
import { CartProvider, CatalogProvider } from '@/lib/catalog';

export default function Providers({ children }: { children: React.ReactNode }) {
  return <CatalogProvider><CartProvider>{children}</CartProvider></CatalogProvider>;
}
