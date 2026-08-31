export interface Brand {
  id: string;
  name: string;
  tagline: string;
  logo: string;
  coverImage: string;
  location: string;
  rating: number;
  reviews: number;
  followers: number;
  productCount: number;
  description: string;
  verified: boolean;
  website?: string;
  contactEmail?: string;
}

export const brands: Brand[] = [
  {
    id: 'brand-1',
    name: 'TrendStyle Co.',
    tagline: 'Premium Fashion for Everyone',
    logo: 'https://api.dicebear.com/7.x/initials/svg?seed=TS&backgroundColor=c084fc&textColor=ffffff',
    coverImage: 'https://img.rocket.new/generatedImages/rocket_gen_img_2bc4c88d8-1773225914256.png',
    location: 'Mumbai, India',
    rating: 4.8,
    reviews: 324,
    followers: 5200,
    productCount: 145,
    description: 'Contemporary fashion brand specializing in casual wear and trendy apparel for fashion-forward individuals.',
    verified: true,
    website: 'https://example.com',
    contactEmail: 'info@trendstyle.com'
  },
  {
    id: 'brand-2',
    name: 'EcoHome Living',
    tagline: 'Sustainable Home Solutions',
    logo: 'https://api.dicebear.com/7.x/initials/svg?seed=EL&backgroundColor=10b981&textColor=ffffff',
    coverImage: 'https://img.rocket.new/generatedImages/rocket_gen_img_653d2e45c-1773225914457.png',
    location: 'Bangalore, India',
    rating: 4.6,
    reviews: 287,
    followers: 3800,
    productCount: 98,
    description: 'Eco-friendly home products designed with sustainability in mind. From organic linens to bamboo furniture.',
    verified: true,
    website: 'https://example.com',
    contactEmail: 'support@ecohome.com'
  },
  {
    id: 'brand-3',
    name: 'TechGear Pro',
    tagline: 'Next-Gen Electronics',
    logo: 'https://api.dicebear.com/7.x/initials/svg?seed=TG&backgroundColor=3b82f6&textColor=ffffff',
    coverImage: 'https://img.rocket.new/generatedImages/rocket_gen_img_a7f9e12b5-1773225914658.png',
    location: 'Delhi, India',
    rating: 4.7,
    reviews: 412,
    followers: 6100,
    productCount: 187,
    description: 'Leading electronics brand offering innovative gadgets, accessories, and smart home solutions.',
    verified: true,
    website: 'https://example.com',
    contactEmail: 'hello@techgearpro.com'
  },
  {
    id: 'brand-4',
    name: 'BeautyEssence',
    tagline: 'Natural Beauty Products',
    logo: 'https://api.dicebear.com/7.x/initials/svg?seed=BE&backgroundColor=ec4899&textColor=ffffff',
    coverImage: 'https://img.rocket.new/generatedImages/rocket_gen_img_f2c3a91d7-1773225914859.png',
    location: 'Pune, India',
    rating: 4.9,
    reviews: 568,
    followers: 7400,
    productCount: 156,
    description: 'Premium beauty and skincare brand with natural ingredients. Cruelty-free and dermatologist-tested products.',
    verified: true,
    website: 'https://example.com',
    contactEmail: 'care@beautyessence.com'
  },
  {
    id: 'brand-5',
    name: 'SportZone',
    tagline: 'Athletic Excellence',
    logo: 'https://api.dicebear.com/7.x/initials/svg?seed=SZ&backgroundColor=f97316&textColor=ffffff',
    coverImage: 'https://img.rocket.new/generatedImages/rocket_gen_img_e4a2f67c9-1773225915060.png',
    location: 'Hyderabad, India',
    rating: 4.5,
    reviews: 291,
    followers: 4900,
    productCount: 112,
    description: 'Complete range of sports equipment, athletic wear, and fitness accessories for all skill levels.',
    verified: true,
    website: 'https://example.com',
    contactEmail: 'support@sportzone.com'
  },
  {
    id: 'brand-6',
    name: 'GourmetSnacks',
    tagline: 'Artisanal & Healthy Snacking',
    logo: 'https://api.dicebear.com/7.x/initials/svg?seed=GS&backgroundColor=8b5cf6&textColor=ffffff',
    coverImage: 'https://img.rocket.new/generatedImages/rocket_gen_img_d5b8e73a2-1773225915261.png',
    location: 'Ahmedabad, India',
    rating: 4.4,
    reviews: 156,
    followers: 2300,
    productCount: 67,
    description: 'Premium artisanal snacks and gourmet food products. Healthy, organic, and delicious.',
    verified: false,
    website: 'https://example.com',
    contactEmail: 'hello@gourmetsnacks.com'
  }
];
