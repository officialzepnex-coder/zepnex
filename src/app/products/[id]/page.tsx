'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/ui/AppIcon';
import { useCart, useCatalog } from '@/lib/catalog';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  const { products, brands } = useCatalog();
  const { addItem } = useCart();
  const product = products.find(p => p.id === productId);
  const brand = product ? brands.find(b => b.id === product.brandId) : null;
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  if (!product || !brand) {
    return (
      <main className="bg-background overflow-x-hidden">
        <Header />
        <div className="pt-24 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-4">Product Not Found</h1>
            <Link href="/products" className="text-primary hover:underline">
              Back to Products
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const handleAddToCart = () => {
    addItem({ id: product.id, name: product.name, price: product.price, image: product.image, brand: brand.name }, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const relatedProducts = products.filter(p => p.brandId === product.brandId && p.id !== product.id).slice(0, 4);

  return (
    <main className="bg-background overflow-x-hidden">
      <Header />

      <div className="pt-16 sm:pt-20 min-h-screen">
        {/* Breadcrumb */}
        <div className="bg-secondary/30 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <Icon name="ChevronRightIcon" size={12} variant="outline" />
              <Link href="/products" className="hover:text-foreground transition-colors">Products</Link>
              <Icon name="ChevronRightIcon" size={12} variant="outline" />
              <span className="text-foreground">{product.name}</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-12">
            {/* Product Image */}
            <div className="flex-shrink-0">
              <div className="relative aspect-square bg-secondary rounded-sm overflow-hidden border border-border">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.badge && (
                  <span className="absolute top-4 right-4 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold uppercase rounded-sm">
                    {product.badge}
                  </span>
                )}
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white text-lg font-semibold">Out of Stock</span>
                  </div>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              {/* Brand */}
              <div>
                <Link href={`/brands/${brand.id}`} className="flex items-center gap-3 w-fit group">
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase">By</p>
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {brand.name}
                    </p>
                  </div>
                </Link>
              </div>

              {/* Title & Rating */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                  {product.name}
                </h1>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Icon
                          key={i}
                          name="StarIcon"
                          size={16}
                          variant={i < Math.floor(product.rating) ? 'solid' : 'outline'}
                          className={i < Math.floor(product.rating) ? 'text-primary' : 'text-muted-foreground'}
                        />
                      ))}
                    </div>
                    <span className="text-foreground font-semibold">{product.rating}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {product.reviews} Reviews
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-foreground">
                    ₹{product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-lg text-muted-foreground line-through">
                      ₹{product.originalPrice}
                    </span>
                  )}
                </div>
                {product.originalPrice && (
                  <span className="text-sm text-primary font-semibold">
                    Save ₹{product.originalPrice - product.price} ({Math.round((1 - product.price / product.originalPrice) * 100)}% off)
                  </span>
                )}
              </div>

              {/* Description */}
              <div>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Quantity & Add to Cart */}
              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-foreground">Quantity:</span>
                  <div className="flex items-center border border-border rounded-sm">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center hover:bg-secondary transition-colors">
                      <Icon name="MinusIcon" size={16} variant="outline" />
                    </button>
                    <span className="w-12 text-center font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center hover:bg-secondary transition-colors">
                      <Icon name="PlusIcon" size={16} variant="outline" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className="flex-1 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    <Icon name="ShoppingBagIcon" size={18} variant="outline" />
                    {addedToCart ? 'Added to Cart!' : 'Add to Cart'}
                  </button>
                  <button className="px-6 py-3 border border-border text-foreground font-semibold rounded-sm hover:border-foreground transition-colors flex items-center justify-center">
                    <Icon name="HeartIcon" size={18} variant="outline" />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-3 pt-4 border-t border-border text-sm">
                <div className="flex items-center gap-3">
                  <Icon name="TruckIcon" size={18} variant="outline" className="text-primary" />
                  <span>Free shipping on orders above ₹500</span>
                </div>
                <div className="flex items-center gap-3">
                  <Icon name="CheckCircleIcon" size={18} variant="outline" className="text-primary" />
                  <span>In stock and ready to ship</span>
                </div>
                <div className="flex items-center gap-3">
                  <Icon name="ArrowPathIcon" size={18} variant="outline" className="text-primary" />
                  <span>30-day return policy</span>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="border-t border-border pt-12">
              <h2 className="text-2xl font-semibold text-foreground mb-6">
                More from <span className="text-primary">{brand.name}</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {relatedProducts.map((relProduct) => (
                  <Link
                    key={relProduct.id}
                    href={`/products/${relProduct.id}`}
                    className="group">
                    <div className="bg-card rounded-sm overflow-hidden border border-border hover:border-primary transition-all">
                      <div className="relative aspect-square bg-muted overflow-hidden">
                        <img
                          src={relProduct.image}
                          alt={relProduct.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                        {relProduct.badge && (
                          <span className="absolute top-2 right-2 px-2 py-1 bg-primary text-primary-foreground text-[10px] font-bold rounded">
                            {relProduct.badge}
                          </span>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="text-xs font-semibold text-foreground line-clamp-2 mb-2">
                          {relProduct.name}
                        </h3>
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-foreground">₹{relProduct.price}</span>
                          {relProduct.originalPrice && (
                            <span className="text-xs text-muted-foreground line-through">₹{relProduct.originalPrice}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
