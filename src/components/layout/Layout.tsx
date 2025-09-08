import React from 'react';
import Header from './Header';
import Footer from './Footer';
import AIChat from '@/components/ai/AIChat';
import { AIProvider } from '@/contexts/AIContext';

interface LayoutProps {
  children: React.ReactNode;
  onSearch?: (query: string) => void;
}

export default function Layout({ children, onSearch }: LayoutProps) {
  return (
    <AIProvider>
      <div className="min-h-screen bg-background">
        <Header onSearch={onSearch} />
        <main className="min-h-screen-header">
          {children}
        </main>
        <Footer />
        <AIChat />
      </div>
    </AIProvider>
  );
}