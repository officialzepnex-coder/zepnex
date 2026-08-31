'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/ui/AppIcon';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  brand: string;
}

export default function CartPage() {
  const [cartItems] = useState<CartItem[]>([
    {
      id: 'prod-1',
      name: 'Classic Cotton T-Shirt',
      price: 499,
      quantity: 2,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=product1&scale=80',
      brand: 'TrendStyle Co.'
    },
    {
      id: 'prod-7',
      name: 'Wireless Bluetooth Earbuds',
      price: 2999,
      quantity: 1,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=product7&scale=80',
      brand: 'TechGear Pro'
    },
    {
      id: 'prod-4',
      name: 'Organic Cotton Bedsheet Set',
      price: 2499,
      quantity: 1,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=product4&scale=80',
      brand: 'EcoHome Living'
    }
  ]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 500 ? 0 : 99;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;

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
              <span className="text-foreground">Shopping Cart</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <h1 className="text-3xl font-bold text-foreground mb-8">Shopping Cart</h1>

          {cartItems.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="border border-border rounded-sm p-4 flex gap-4">
                    {/* Item Image */}
                    <Link href={`/products/${item.id}`} className="flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-sm"
                      />
                    </Link>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.id}`}>
                        <h3 className="font-semibold text-foreground hover:text-primary transition-colors mb-1 line-clamp-2">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="text-xs text-muted-foreground mb-2">{item.brand}</p>
                      <p className="text-lg font-bold text-foreground">₹{item.price}</p>
                    </div>

                    {/* Quantity & Actions */}
                    <div className="flex flex-col items-end gap-4">
                      <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                        <Icon name="TrashIcon" size={18} variant="outline" />
                      </button>
                      <div className="flex items-center border border-border rounded-sm">
                        <button className="w-8 h-8 flex items-center justify-center hover:bg-secondary transition-colors">
                          <Icon name="MinusIcon" size={14} variant="outline" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                        <button className="w-8 h-8 flex items-center justify-center hover:bg-secondary transition-colors">
                          <Icon name="PlusIcon" size={14} variant="outline" />
                        </button>
                      </div>
                      <p className="font-semibold text-foreground">
                        ₹{item.price * item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="border border-border rounded-sm p-6 sticky top-24 bg-card">
                  <h2 className="text-lg font-bold text-foreground mb-6">Order Summary</h2>

                  <div className="space-y-4 mb-6 pb-6 border-b border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground font-medium">₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className={subtotal > 500 ? 'text-primary font-medium' : 'text-foreground font-medium'}>
                        {subtotal > 500 ? 'Free' : `₹${shipping}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="text-foreground font-medium">₹{tax.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex justify-between mb-6">
                    <span className="text-lg font-bold text-foreground">Total</span>
                    <span className="text-2xl font-bold text-primary">₹{total.toLocaleString()}</span>
                  </div>

                  <button className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mb-3">
                    <Icon name="CreditCardIcon" size={18} variant="outline" />
                    Proceed to Checkout
                  </button>

                  <Link
                    href="/products"
                    className="block text-center py-2.5 border border-border text-foreground font-medium rounded-sm hover:border-foreground transition-colors">
                    Continue Shopping
                  </Link>

                  {subtotal <= 500 && (
                    <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-sm">
                      <p className="text-xs text-primary font-medium">
                        Add ₹{500 - subtotal} more to get free shipping!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Icon name="ShoppingBagIcon" size={40} variant="outline" className="text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Your Cart is Empty</h2>
              <p className="text-muted-foreground mb-8">Start shopping to add items to your cart.</p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-sm hover:opacity-90 transition-opacity">
                <Icon name="ShoppingBagIcon" size={18} variant="outline" />
                Start Shopping
              </Link>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
