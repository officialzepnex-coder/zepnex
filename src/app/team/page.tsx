'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/ui/AppIcon';
import { DataService } from '@/lib/supabase/data-service';
import type { TeamMemberRow } from '@/types/database';

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMemberRow[]>([]);

  useEffect(() => {
    const load = () => DataService.getTeamMembers().then((members) => setTeamMembers(members.filter((member) => member.published)));
    load();
    window.addEventListener('zepnex_catalog_updated', load);
    return () => window.removeEventListener('zepnex_catalog_updated', load);
  }, []);

  return (
    <main className="bg-background overflow-x-hidden">
      <Header />

      <div className="pt-16 sm:pt-20 min-h-screen">
        <div className="bg-secondary/30 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <Icon name="ChevronRightIcon" size={12} variant="outline" />
              <span className="text-foreground">Team</span>
            </div>
          </div>
        </div>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="mb-12 text-center">
            <span className="mb-4 block text-xs font-semibold uppercase tracking-[0.3em] text-primary">Our Team</span>
            <h1 className="font-display text-3xl font-semibold text-foreground sm:text-5xl">
              The people behind <span className="text-primary">ZEPNEX</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
              A focused group of builders, strategists, and experience designers creating the future of shopping for modern India.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {teamMembers.map((member) => (
              <div key={member.name} className="overflow-hidden rounded-sm border border-border bg-card transition-transform hover:-translate-y-1 hover:shadow-xl">
                <img src={member.image} alt={member.name} className="h-72 w-full object-cover" />
                <div className="p-6">
                  <p className="text-lg font-semibold text-foreground">{member.name}</p>
                  <p className="mt-1 text-sm font-medium text-primary">{member.role}</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
