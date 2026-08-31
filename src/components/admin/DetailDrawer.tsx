'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface DetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  widthClass?: string;
}

export default function DetailDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  children,
  actions,
  widthClass = 'max-w-2xl',
}: DetailDrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className={`w-screen ${widthClass} bg-card border-l border-border shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-border bg-secondary/30 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <h2 className="font-display text-xl font-semibold text-foreground truncate">{title}</h2>
                {badge}
              </div>
              {subtitle && <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">{children}</div>

          {/* Drawer Footer Actions */}
          {actions && (
            <div className="px-6 py-4 border-t border-border bg-secondary/30 flex items-center justify-end gap-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
