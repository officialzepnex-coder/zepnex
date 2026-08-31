'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ProductEditor from '@/components/admin/ProductEditor';
import { DataService } from '@/lib/supabase/data-service';
import type { ProductRow } from '@/types/database';

export default function EditProductPage() {
  const params = useParams();
  const id = params?.id as string;
  const [row, setRow] = useState<ProductRow | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    DataService.getProductById(id)
      .then((data) => {
        if (data) setRow(data);
        else setError(`Product with ID "${id}" was not found.`);
      })
      .catch((err) => setError(err.message || 'Failed to load product'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-center text-sm text-muted-foreground">Loading product details...</div>;
  if (error) return <div className="p-4 border border-red-200 bg-red-50 text-sm text-red-800 rounded">{error}</div>;
  if (!row) return <div className="p-8 text-center text-sm text-muted-foreground">Product not found.</div>;

  return <ProductEditor initial={row} />;
}
