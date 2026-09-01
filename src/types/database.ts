export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';
export type ReviewKind = 'homepage' | 'brand' | 'product';
export type UserRole = 'user' | 'admin';

export interface TeamMemberRow {
  id: string;
  name: string;
  role: string;
  image: string;
  bio: string;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface BrandRow {
  id: string;
  name: string;
  tagline: string;
  logo: string;
  cover_image: string;
  location: string;
  rating: number;
  reviews: number;
  followers: number;
  product_count: number;
  description: string;
  verified: boolean;
  website: string | null;
  contact_email: string | null;
  featured: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductRow {
  id: string;
  name: string;
  brand_id: string;
  brand_name: string;
  category: string;
  price: number;
  original_price: number | null;
  rating: number;
  reviews: number;
  image: string;
  images: string[] | null;
  description: string;
  in_stock: boolean;
  stock_quantity?: number;
  badge: string | null;
  featured: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryRow {
  id: string;
  name: string;
  sort_order: number;
  published: boolean;
  icon?: string;
  product_count?: number;
}

export interface ReviewRow {
  id: string;
  kind: ReviewKind;
  brand_id: string | null;
  product_id: string | null;
  author: string;
  role: string | null;
  rating: number;
  comment: string;
  avatar: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApplicationRow {
  id: string;
  brand_name: string;
  email: string;
  phone: string | null;
  category: string | null;
  message: string | null;
  status: ApplicationStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FaqRow {
  id: string;
  question: string;
  answer: string;
  category?: string;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteSettingRow {
  key: string;
  value: Json;
  updated_at: string;
}

export interface ProfileRow {
  id: string;
  email: string | null;
  role: UserRole;
  created_at: string;
}

export interface HomepageSettings {
  eyebrow: string;
  title: string;
  highlight: string;
  subtitle: string;
  image: string;
  ctaPrimary: string;
  ctaSecondary: string;
  announcementBar?: {
    enabled: boolean;
    text: string;
    linkText?: string;
    linkUrl?: string;
  };
}

export interface ActivityLog {
  id: string;
  action: 'create' | 'update' | 'delete' | 'sync';
  entity: 'brand' | 'product' | 'category' | 'review' | 'application' | 'faq' | 'setting' | 'database';
  entity_id?: string;
  title: string;
  details?: string;
  timestamp: string;
}

export interface SyncStepResult {
  step: string;
  status: 'pending' | 'running' | 'success' | 'error';
  count?: number;
  message?: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow>;
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      brands: {
        Row: BrandRow;
        Insert: Partial<BrandRow>;
        Update: Partial<BrandRow>;
        Relationships: [];
      };
      products: {
        Row: ProductRow;
        Insert: Partial<ProductRow>;
        Update: Partial<ProductRow>;
        Relationships: [];
      };
      categories: {
        Row: CategoryRow;
        Insert: Partial<CategoryRow>;
        Update: Partial<CategoryRow>;
        Relationships: [];
      };
      reviews: {
        Row: ReviewRow;
        Insert: Partial<ReviewRow>;
        Update: Partial<ReviewRow>;
        Relationships: [];
      };
      brand_applications: {
        Row: ApplicationRow;
        Insert: Partial<ApplicationRow>;
        Update: Partial<ApplicationRow>;
        Relationships: [];
      };
      faqs: {
        Row: FaqRow;
        Insert: Partial<FaqRow>;
        Update: Partial<FaqRow>;
        Relationships: [];
      };
      site_settings: {
        Row: SiteSettingRow;
        Insert: Partial<SiteSettingRow> & { key?: string };
        Update: Partial<SiteSettingRow>;
        Relationships: [];
      };
      team_members: {
        Row: TeamMemberRow;
        Insert: Partial<TeamMemberRow>;
        Update: Partial<TeamMemberRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export const DEFAULT_HOMEPAGE: HomepageSettings = {
  eyebrow: "India's Premier Multi-Brand Marketplace",
  title: 'Every Brand You Love,',
  highlight: 'One Place to Shop',
  subtitle:
    'Discover unique small brands, trending clothes, and daily essentials — curated for everyday shoppers, style hunters, budget families, and loyal brand followers.',
  image: 'https://img.rocket.new/generatedImages/rocket_gen_img_153c96c78-1773225913955.png',
  ctaPrimary: 'Shop Products',
  ctaSecondary: 'Explore Brands',
  announcementBar: {
    enabled: true,
    text: '🎉 Welcome to ZEPNEX! Explore 500+ curated artisan and premium brands with fast nationwide delivery.',
    linkText: 'Explore Now',
    linkUrl: '/products',
  },
};
