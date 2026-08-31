export interface Product {
  id: string;
  name: string;
  brandId: string;
  brandName: string;
  category: 'Clothing' | 'Daily Use' | 'Electronics' | 'Home & Living' | 'Beauty' | 'Sports';
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  images?: string[];
  description: string;
  inStock: boolean;
  badge?: string;
}

export const products: Product[] = [
  // TrendStyle Co. Products
  {
    id: 'prod-1',
    name: 'Classic Cotton T-Shirt',
    brandId: 'brand-1',
    brandName: 'TrendStyle Co.',
    category: 'Clothing',
    price: 499,
    originalPrice: 999,
    rating: 4.6,
    reviews: 234,
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=product1&scale=80',
    description: 'Premium quality cotton t-shirt with perfect fit. Available in multiple colors.',
    inStock: true,
    badge: 'Sale'
  },
  {
    id: 'prod-2',
    name: 'Slim Fit Jeans',
    brandId: 'brand-1',
    brandName: 'TrendStyle Co.',
    category: 'Clothing',
    price: 1299,
    originalPrice: 2499,
    rating: 4.7,
    reviews: 189,
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=product2&scale=80',
    description: 'Trendy slim fit jeans with premium denim fabric. Comfortable and durable.',
    inStock: true,
    badge: 'Sale'
  },
  {
    id: 'prod-3',
    name: 'Summer Casual Shorts',
    brandId: 'brand-1',
    brandName: 'TrendStyle Co.',
    category: 'Clothing',
    price: 699,
    rating: 4.5,
    reviews: 123,
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=product3&scale=80',
    description: 'Light and breathable shorts perfect for summer. Multiple color options available.',
    inStock: true
  },
  // EcoHome Living Products
  {
    id: 'prod-4',
    name: 'Organic Cotton Bedsheet Set',
    brandId: 'brand-2',
    brandName: 'EcoHome Living',
    category: 'Home & Living',
    price: 2499,
    originalPrice: 3999,
    rating: 4.8,
    reviews: 287,
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=product4&scale=80',
    description: 'Premium organic cotton bedsheet set. Eco-friendly and supremely comfortable.',
    inStock: true,
    badge: 'New'
  },
  {
    id: 'prod-5',
    name: 'Bamboo Cutting Board Set',
    brandId: 'brand-2',
    brandName: 'EcoHome Living',
    category: 'Home & Living',
    price: 899,
    rating: 4.4,
    reviews: 156,
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=product5&scale=80',
    description: 'Sustainable bamboo cutting board set for your kitchen. Durable and eco-friendly.',
    inStock: true
  },
  {
    id: 'prod-6',
    name: 'Eco-Friendly Food Storage',
    brandId: 'brand-2',
    brandName: 'EcoHome Living',
    category: 'Daily Use',
    price: 1299,
    rating: 4.6,
    reviews: 198,
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=product6&scale=80',
    description: 'Reusable glass food storage containers. Plastic-free and sustainable solution.',
    inStock: true,
    badge: 'Best Seller'
  },
  // TechGear Pro Products
  {
    id: 'prod-7',
    name: 'Wireless Bluetooth Earbuds',
    brandId: 'brand-3',
    brandName: 'TechGear Pro',
    category: 'Electronics',
    price: 2999,
    originalPrice: 5999,
    rating: 4.7,
    reviews: 412,
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=product7&scale=80',
    description: 'Premium wireless earbuds with active noise cancellation. 30-hour battery life.',
    inStock: true,
    badge: 'Sale'
  },
  {
    id: 'prod-8',
    name: 'Fast Charging USB-C Cable',
    brandId: 'brand-3',
    brandName: 'TechGear Pro',
    category: 'Electronics',
    price: 399,
    rating: 4.5,
    reviews: 267,
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=product8&scale=80',
    description: 'Durable USB-C charging cable with fast charging support. 2-meter length.',
    inStock: true
  },
  {
    id: 'prod-9',
    name: 'Smart LED Light Bulb',
    brandId: 'brand-3',
    brandName: 'TechGear Pro',
    category: 'Electronics',
    price: 799,
    rating: 4.6,
    reviews: 324,
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=product9&scale=80',
    description: 'WiFi-enabled smart bulb with 16 million color options. Voice control compatible.',
    inStock: true,
    badge: 'New'
  },
  // BeautyEssence Products
  {
    id: 'prod-10',
    name: 'Natural Face Cleanser',
    brandId: 'brand-4',
    brandName: 'BeautyEssence',
    category: 'Beauty',
    price: 649,
    originalPrice: 1299,
    rating: 4.8,
    reviews: 456,
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=product10&scale=80',
    description: 'Gentle, natural face cleanser suitable for all skin types. Cruelty-free and organic.',
    inStock: true,
    badge: 'Best Seller'
  },
  {
    id: 'prod-11',
    name: 'Vitamin C Serum',
    brandId: 'brand-4',
    brandName: 'BeautyEssence',
    category: 'Beauty',
    price: 1299,
    rating: 4.9,
    reviews: 378,
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=product11&scale=80',
    description: 'Brightening vitamin C serum. Dermatologist-tested and highly effective.',
    inStock: true
  },
  {
    id: 'prod-12',
    name: 'Moisturizing Night Cream',
    brandId: 'brand-4',
    brandName: 'BeautyEssence',
    category: 'Beauty',
    price: 899,
    rating: 4.7,
    reviews: 289,
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=product12&scale=80',
    description: 'Rich night cream with natural ingredients. Restore and rejuvenate your skin.',
    inStock: true
  },
  // SportZone Products
  {
    id: 'prod-13',
    name: 'Professional Yoga Mat',
    brandId: 'brand-5',
    brandName: 'SportZone',
    category: 'Sports',
    price: 1499,
    originalPrice: 2499,
    rating: 4.6,
    reviews: 267,
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=product13&scale=80',
    description: 'Non-slip yoga mat with extra cushioning. Lightweight and eco-friendly TPE material.',
    inStock: true,
    badge: 'Sale'
  },
  {
    id: 'prod-14',
    name: 'Adjustable Dumbbells Set',
    brandId: 'brand-5',
    brandName: 'SportZone',
    category: 'Sports',
    price: 3999,
    rating: 4.8,
    reviews: 345,
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=product14&scale=80',
    description: 'Adjustable dumbbells from 5kg to 25kg. Perfect for home workouts.',
    inStock: true,
    badge: 'New'
  },
  {
    id: 'prod-15',
    name: 'Running Shoes',
    brandId: 'brand-5',
    brandName: 'SportZone',
    category: 'Sports',
    price: 2999,
    originalPrice: 4999,
    rating: 4.7,
    reviews: 198,
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=product15&scale=80',
    description: 'Comfortable running shoes with advanced cushioning technology.',
    inStock: true,
    badge: 'Sale'
  },
  // GourmetSnacks Products
  {
    id: 'prod-16',
    name: 'Roasted Almonds Mix',
    brandId: 'brand-6',
    brandName: 'GourmetSnacks',
    category: 'Daily Use',
    price: 349,
    originalPrice: 599,
    rating: 4.5,
    reviews: 123,
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=product16&scale=80',
    description: 'Premium roasted almonds with no added sugar. Healthy and delicious.',
    inStock: true,
    badge: 'Best Seller'
  },
  {
    id: 'prod-17',
    name: 'Organic Granola Cereal',
    brandId: 'brand-6',
    brandName: 'GourmetSnacks',
    category: 'Daily Use',
    price: 299,
    rating: 4.4,
    reviews: 89,
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=product17&scale=80',
    description: 'Organic granola cereal with natural honey and dried fruits.',
    inStock: true
  },
  {
    id: 'prod-18',
    name: 'Dark Chocolate Bars Pack',
    brandId: 'brand-6',
    brandName: 'GourmetSnacks',
    category: 'Daily Use',
    price: 499,
    rating: 4.6,
    reviews: 145,
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=product18&scale=80',
    description: 'Premium dark chocolate bars with 70% cocoa. Pack of 5.',
    inStock: true
  }
];
