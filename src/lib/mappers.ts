import type { Brand } from '@/data/brands';
import type { Product } from '@/data/products';
import type { BrandRow, ProductRow } from '@/types/database';

export function mapBrand(row: BrandRow): Brand {
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline,
    logo: row.logo,
    coverImage: row.cover_image,
    location: row.location,
    rating: Number(row.rating),
    reviews: row.reviews,
    followers: row.followers,
    productCount: row.product_count,
    description: row.description,
    verified: row.verified,
    website: row.website || undefined,
    contactEmail: row.contact_email || undefined,
  };
}

export function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    brandId: row.brand_id,
    brandName: row.brand_name,
    category: row.category as Product['category'],
    price: Number(row.price),
    originalPrice: row.original_price != null ? Number(row.original_price) : undefined,
    rating: Number(row.rating),
    reviews: row.reviews,
    image: row.image,
    images: row.images || undefined,
    description: row.description,
    inStock: row.in_stock,
    badge: row.badge || undefined,
  };
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function formatInr(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string) {
  return new Date(value).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
