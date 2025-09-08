import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import AIChat from '@/components/ai/AIChat';
import { AIProvider } from '@/contexts/AIContext';
import AdminSidebar from './AdminSidebar';

interface LayoutProps {
  children: React.ReactNode;
  onSearch?: (query: string) => void;
}

export default function Layout({ children, onSearch }: LayoutProps) {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <AIProvider>
      <div className="min-h-screen bg-background">
        <Header onSearch={onSearch} />
        <div className="flex">
          {isAdminPage && <AdminSidebar />}
          <main className="min-h-screen-header flex-1">
            {children}
          </main>
        </div>
        <Footer />
        <AIChat />
      </div>
    </AIProvider>
  );
}
