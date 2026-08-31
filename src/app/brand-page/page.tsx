import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/ui/AppIcon';

export default function JoinBrandPage() {
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
              <span className="text-foreground">Join as a Brand</span>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative py-16 sm:py-24 bg-gradient-to-b from-primary/10 to-background border-b border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="text-3xl sm:text-5xl font-bold text-foreground mb-4">
              Grow Your Brand on <span className="text-primary">ZEPNEX</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join India's fastest-growing multi-brand marketplace. Reach millions of customers, boost your sales, and build your brand.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: 'UserGroupIcon',
                title: 'Reach Millions',
                description: 'Access ZEPNEX\'s growing customer base across India'
              },
              {
                icon: 'ShoppingBagIcon',
                title: 'Increase Sales',
                description: 'Boost your revenue with minimal marketing effort'
              },
              {
                icon: 'ChartBarIcon',
                title: 'Analytics Dashboard',
                description: 'Track sales, inventory, and customer insights in real-time'
              },
              {
                icon: 'TruckIcon',
                title: 'Logistics Support',
                description: 'Seamless integration with delivery partners'
              },
              {
                icon: 'HeartIcon',
                title: 'Brand Recognition',
                description: 'Showcase your products to loyal brand followers'
              },
              {
                icon: 'SparklesIcon',
                title: '24/7 Support',
                description: 'Dedicated support team to help you succeed'
              },
            ].map((benefit, idx) => (
              <div key={idx} className="border border-border rounded-sm p-6 bg-card hover:border-primary transition-colors">
                <Icon name={benefit.icon as Parameters<typeof Icon>[0]['name']} size={32} variant="outline" className="text-primary mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>

          {/* Join Form Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-12 border-t border-border">
            {/* Left — Info */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Why Join ZEPNEX?
              </h2>
              <ul className="space-y-4 text-muted-foreground">
                {[
                  'Zero commission on first 100 orders',
                  'Free storefront setup and customization',
                  'Built-in payment gateway integration',
                  'Performance analytics and insights',
                  'Customer support and brand protection',
                  'Marketing assistance and promotions'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Icon name="CheckCircleIcon" size={20} variant="solid" className="text-primary flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right — Form */}
            <div className="bg-card border border-border rounded-sm p-8">
              <h3 className="text-2xl font-bold text-foreground mb-6">Get Started</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Brand Name</label>
                  <input
                    type="text"
                    placeholder="Your brand name"
                    className="w-full px-4 py-2.5 border border-border rounded-sm bg-background focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="w-full px-4 py-2.5 border border-border rounded-sm bg-background focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    className="w-full px-4 py-2.5 border border-border rounded-sm bg-background focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Brand Category</label>
                  <select className="w-full px-4 py-2.5 border border-border rounded-sm bg-background focus:outline-none focus:border-primary transition-colors">
                    <option>Select a category</option>
                    <option>Fashion & Apparel</option>
                    <option>Electronics</option>
                    <option>Home & Living</option>
                    <option>Beauty & Wellness</option>
                    <option>Sports & Fitness</option>
                    <option>Food & Beverages</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      className="w-4 h-4 border border-border rounded accent-primary"
                    />
                    <span className="text-xs text-muted-foreground">
                      I agree to ZEPNEX's Terms of Service and Privacy Policy
                    </span>
                  </label>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-primary text-primary-foreground font-semibold uppercase tracking-wider rounded-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                  <Icon name="PaperAirplaneIcon" size={16} variant="outline" />
                  Submit Application
                </button>
              </form>
              <p className="text-xs text-muted-foreground text-center mt-4">
                We'll review your application and get back to you within 48 hours.
              </p>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16 pt-12 border-t border-border">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[
                {
                  q: 'What are the eligibility requirements?',
                  a: 'Your brand should have at least 6 months of operation with genuine products and good customer reviews.'
                },
                {
                  q: 'How long does approval take?',
                  a: 'Most applications are approved within 24-48 hours. We\'ll notify you via email about the status.'
                },
                {
                  q: 'What are the fees involved?',
                  a: 'We charge a small commission on each sale. New brands get zero commission on the first 100 orders!'
                },
                {
                  q: 'Can I list multiple product categories?',
                  a: 'Yes! You can list products from different categories. We support up to 20 categories per brand.'
                }
              ].map((faq, idx) => (
                <div key={idx} className="border border-border rounded-sm p-4">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Icon name="QuestionMarkCircleIcon" size={18} variant="outline" className="text-primary flex-shrink-0" />
                    {faq.q}
                  </h4>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}