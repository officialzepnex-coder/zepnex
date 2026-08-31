'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import BrandEditor from '@/components/admin/BrandEditor';
import { DataService } from '@/lib/supabase/data-service';
import type { BrandRow } from '@/types/database';

export default function EditBrandPage() {
  const params = useParams();
  const id = params?.id as string;
  const [row, setRow] = useState<BrandRow | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    DataService.getBrandById(id)
      .then((data) => {
        if (data) setRow(data);
        else setError(`Brand with ID "${id}" was not found.`);
      })
      .catch((err) => setError(err.message || 'Failed to load brand'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-center text-sm text-muted-foreground">Loading brand details...</div>;
  if (error) return <div className="p-4 border border-red-200 bg-red-50 text-sm text-red-800 rounded">{error}</div>;
  if (!row) return <div className="p-8 text-center text-sm text-muted-foreground">Brand not found.</div>;

  return <BrandEditor initial={row} />;
}
