import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  Ticket, 
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';

export default function AdminSidebar() {
  const { t } = useLanguage();
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
      title: 'แดชบอร์ด',
      href: '/admin',
      icon: LayoutDashboard,
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:bg-blue-100',
      textColor: 'text-blue-700'
    },
    {
      title: 'อีเว้นท์',
      href: '/admin/events',
      icon: Calendar,
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:bg-green-100',
      textColor: 'text-green-700'
    },
    {
      title: 'ตั๋วทั้งหมด',
      href: '/admin/tickets',
      icon: Ticket,
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:bg-purple-100',
      textColor: 'text-purple-700'
    },
  ];

  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    // Redirect to login page
    navigate('/login');
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      <div className="lg:hidden fixed inset-0 z-40 bg-black/50 hidden" id="sidebar-overlay"></div>
      
      {/* Sidebar */}
      <div className="hidden lg:block w-64 border-r bg-gradient-to-b from-blue-50 via-white to-purple-50 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-16 h-[calc(100vh-4rem)] overflow-hidden shadow-xl">
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
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg scale-[1.02]`
                        : `text-muted-foreground ${item.hoverColor} hover:text-primary hover:shadow-md hover:scale-[1.02]`
                    )}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.title}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          <div className="border-t border-border/50 p-4">
            <Button 
              variant="outline" 
              className="w-full gap-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md border-0"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              ออกจากระบบ
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}