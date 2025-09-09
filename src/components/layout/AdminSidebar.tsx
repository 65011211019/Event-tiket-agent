import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Ticket, 
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage, useAuth } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

export default function AdminSidebar() {
  const { t } = useLanguage();
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    // Special case for dashboard - exact match only
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname === path;
  };

  const navItems = [
    {
      title: t('admin.dashboard'),
      href: '/admin',
      icon: LayoutDashboard,
    },
    {
      title: t('admin.events'),
      href: '/admin/events',
      icon: Calendar,
    },
    {
      title: t('admin.tickets'),
      href: '/admin/tickets',
      icon: Ticket,
    },
  ];

  const handleLogout = () => {
    // Use the logout function from AuthContext like in Header.tsx
    logout();
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      <div className="lg:hidden fixed inset-0 z-40 bg-black/50 hidden" id="sidebar-overlay"></div>
      
      {/* Sidebar */}
      <div className="hidden lg:block w-64 border-r bg-sidebar text-sidebar-foreground sticky top-16 h-[calc(100vh-4rem)] overflow-hidden shadow-xl">
        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-y-auto py-6">
            <nav className="space-y-3 px-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ease-in-out transform",
                      active
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg scale-[1.02]'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-md hover:scale-[1.02]'
                    )}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.title}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          <div className="border-t border-sidebar-border/50 p-4">
            <Button 
              variant="outline" 
              className="w-full gap-2 rounded-xl bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/90 transition-all duration-200 shadow-md border-0"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              {t('general.logout')}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
