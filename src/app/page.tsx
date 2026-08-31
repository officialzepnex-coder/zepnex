import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from './components/HeroSection';
import FeaturedBrandsSection from './components/FeaturedBrandsSection';
import CategoryProductSection from './components/CategoryProductSection';
import WhyBrandMartSection from './components/WhyBrandMartSection';
import TestimonialsSection from './components/TestimonialsSection';
import JoinBrandCTA from './components/JoinBrandCTA';
import ScrollRevealSection from './components/ScrollRevealSection';

export default function HomePage() {
  return (
    <main className="relative overflow-x-hidden bg-background">
      <Header />
      <HeroSection />
      <FeaturedBrandsSection />
      <ScrollRevealSection />
      <CategoryProductSection />
      <WhyBrandMartSection />
      <TestimonialsSection />
      <JoinBrandCTA />
      <Footer />
    </main>
  );
}