import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductsContent from './components/ProductsContent';

export default function ProductsPage() {
  return (
    <main className="bg-background overflow-x-hidden">
      <Header />
      <ProductsContent />
      <Footer />
    </main>
  );
}