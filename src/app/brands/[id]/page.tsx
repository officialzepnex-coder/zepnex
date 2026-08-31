'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/ui/AppIcon';
import { useCatalog } from '@/lib/catalog';

export default function BrandDetailPage() {
  const params = useParams();
  const brandId = params.id as string;
  const { brands, products, reviews: allReviews } = useCatalog();
  const brand = brands.find(b => b.id === brandId);
  const [following, setFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'about' | 'reviews'>('products');

  if (!brand) {
    return (
      <main className="bg-background overflow-x-hidden">
        <Header />
        <div className="pt-24 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-4">Brand Not Found</h1>
            <Link href="/brands" className="text-primary hover:underline">
              Back to Brands
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const brandProducts = products.filter(p => p.brandId === brand.id);
  const reviews = allReviews.filter((r) => r.kind === 'brand' && r.brand_id === brand.id);

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
              <span className="text-foreground">{brand.name}</span>
            </div>
          </div>
        </div>

        {/* Brand Cover & Header */}
        <div className="relative">
          {/* Cover Image */}
          <div className="relative h-48 sm:h-64 lg:h-80 overflow-hidden bg-gradient-to-br from-primary/20 to-primary/10">
            <img
              src={brand.coverImage}
              alt={brand.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          </div>

          {/* Brand Identity */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-end -mt-10 sm:-mt-12 relative z-10">
              {/* Brand Logo */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-sm border-4 border-background bg-card shadow-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                <img src={brand.logo} alt={brand.name} className="w-full h-full object-cover" />
              </div>

              {/* Brand Info */}
              <div className="flex-1 pb-2">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                    {brand.name}
                  </h1>
                  {brand.verified && (
                    <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider rounded-sm flex items-center gap-1">
                      <Icon name="CheckBadgeIcon" size={12} variant="solid" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3">{brand.tagline}</p>
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-2">
                  <span className="flex items-center gap-1">
                    <Icon name="StarIcon" size={12} variant="solid" className="text-primary" />
                    {brand.rating} Rating
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="ChatBubbleLeftEllipsisIcon" size={12} variant="outline" />
                    {brand.reviews} Reviews
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="ShoppingBagIcon" size={12} variant="outline" />
                    {brand.productCount} Products
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="UserGroupIcon" size={12} variant="outline" />
                    {brand.followers.toLocaleString()} Followers
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="MapPinIcon" size={12} variant="outline" />
                    {brand.location}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pb-2 w-full sm:w-auto">
                <button
                  onClick={() => setFollowing(!following)}
                  className={`flex-1 sm:flex-none px-5 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-sm transition-all min-h-[44px] flex items-center justify-center gap-1.5 ${
                    following
                      ? 'bg-muted text-muted-foreground border border-border'
                      : 'bg-primary text-primary-foreground hover:opacity-90'
                  }`}>
                  <Icon name={following ? 'CheckIcon' : 'PlusIcon'} size={14} variant="outline" />
                  {following ? 'Following' : 'Follow'}
                </button>
                <Link
                  href="#contact-brand"
                  className="flex-1 sm:flex-none px-5 py-2.5 border border-border text-foreground text-xs font-medium uppercase tracking-wider hover:border-foreground transition-colors rounded-sm min-h-[44px] flex items-center justify-center gap-1.5">
                  <Icon name="ChatBubbleLeftEllipsisIcon" size={14} variant="outline" />
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* About Section */}
          <div className="mb-12 pb-12 border-b border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">About {brand.name}</h2>
            <p className="text-muted-foreground leading-relaxed max-w-3xl">
              {brand.description}
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="flex gap-1 border-b border-border">
              {['products', 'about', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-6 py-3 text-sm font-semibold uppercase tracking-wider border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'text-primary border-primary'
                      : 'text-muted-foreground border-transparent hover:text-foreground'
                  }`}>
                  {tab === 'products' ? `Products (${brandProducts.length})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div>
              {brandProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {brandProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="group">
                      <div className="bg-card rounded-sm overflow-hidden border border-border hover:border-primary hover:shadow-lg transition-all">
                        <div className="relative aspect-square bg-muted overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                          {product.badge && (
                            <span className="absolute top-2 right-2 px-2 py-1 bg-primary text-primary-foreground text-[10px] font-bold rounded">
                              {product.badge}
                            </span>
                          )}
                        </div>
                        <div className="p-3">
                          <h3 className="text-xs font-semibold text-foreground line-clamp-2 mb-2">
                            {product.name}
                          </h3>
                          <div className="flex items-baseline gap-2 mb-2">
                            <span className="font-bold text-foreground">₹{product.price}</span>
                            {product.originalPrice && (
                              <span className="text-xs text-muted-foreground line-through">₹{product.originalPrice}</span>
                            )}
                          </div>
                          <button className="w-full px-2 py-1.5 bg-primary text-primary-foreground text-[10px] font-bold rounded hover:opacity-90 transition-opacity">
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No products available from this brand yet.</p>
                </div>
              )}
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="max-w-3xl space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Brand Story</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {brand.description}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Contact Information</h3>
                <div className="space-y-2 text-muted-foreground text-sm">
                  <div className="flex items-center gap-3">
                    <Icon name="EnvelopeIcon" size={16} variant="outline" />
                    <a href={`mailto:${brand.contactEmail}`} className="hover:text-primary transition-colors">
                      {brand.contactEmail}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Icon name="MapPinIcon" size={16} variant="outline" />
                    {brand.location}
                  </div>
                  {brand.website && (
                    <div className="flex items-center gap-3">
                      <Icon name="GlobeAltIcon" size={16} variant="outline" />
                      <a href={brand.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                        {brand.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="max-w-3xl">
              <div className="mb-8 p-6 bg-secondary/30 rounded-sm">
                <div className="flex items-center gap-6">
                  <div>
                    <div className="text-4xl font-bold text-foreground">{brand.rating}</div>
                    <div className="flex gap-1 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Icon
                          key={i}
                          name="StarIcon"
                          size={16}
                          variant={i < Math.floor(brand.rating) ? 'solid' : 'outline'}
                          className={i < Math.floor(brand.rating) ? 'text-primary' : 'text-muted-foreground'}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Based on {brand.reviews} reviews</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {reviews.map((review, idx) => (
                  <div key={idx} className="border border-border rounded-sm p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-foreground">{review.author}</h4>
                        <div className="flex gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Icon
                              key={i}
                              name="StarIcon"
                              size={14}
                              variant={i < review.rating ? 'solid' : 'outline'}
                              className={i < review.rating ? 'text-primary' : 'text-muted-foreground'}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  </div>
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
