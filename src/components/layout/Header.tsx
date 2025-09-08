import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Globe, Moon, Sun, User, LogOut, Settings, Calendar, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage, useTheme, useAuth } from '@/contexts/AppContext';

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export default function Header({ onSearch }: HeaderProps) {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
    if (location.pathname !== '/events') {
      navigate(`/events?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        {isAdmin ? (
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              EventTix
            </span>
          </div>
        ) : (
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              EventTix
            </span>
          </Link>
        )}

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex ml-8 space-x-6">
          {isAdmin ? (
            // Admin เห็นเฉพาะลิงก์ admin
            <Link
              to="/admin"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname.startsWith('/admin') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {t('nav.admin')}
            </Link>
          ) : (
            // User ปกติเห็นลิงก์ทั่วไป
            <>
              <Link
                to="/"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {t('nav.home')}
              </Link>
              <Link
                to="/events"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/events') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {t('nav.events')}
              </Link>
              {user && (
                <Link
                  to="/my-tickets"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive('/my-tickets') ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {t('nav.myTickets')}
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Search - Hidden on mobile, shown on tablet+ */}
        <div className="hidden md:flex flex-1 justify-center max-w-md mx-auto">
          <form onSubmit={handleSearch} className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('general.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full"
            />
          </form>
        </div>

        {/* Right side controls */}
        <div className="flex items-center space-x-1 md:space-x-2">
          {/* Language Toggle - Hidden on small screens */}
          <div className="hidden sm:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Globe className="h-4 w-4" />
                  <span className="ml-1 text-xs font-medium hidden md:inline">
                    {language.toUpperCase()}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage('th')}>
                  ไทย (Thai)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('en')}>
                  English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Theme Toggle */}
          <Button variant="ghost" size="sm" onClick={toggleTheme}>
            {theme === 'light' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Button>

          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4" />
                  <span className="ml-2 hidden lg:inline">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-muted-foreground">{user.email}</div>
                </div>
                <DropdownMenuSeparator />
                {isAdmin ? (
                  // Admin เห็นเฉพาะรายการ admin
                  <DropdownMenuItem onClick={() => navigate('/admin')}>
                    <Settings className="mr-2 h-4 w-4" />
                    {t('nav.admin')}
                  </DropdownMenuItem>
                ) : (
                  // User ปกติเห็นรายการทั่วไป
                  <>
                    <DropdownMenuItem onClick={() => navigate('/my-tickets')}>
                      <Calendar className="mr-2 h-4 w-4" />
                      {t('nav.myTickets')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      {t('nav.settings')}
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  ออกจากระบบ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/login')}
              className="hidden sm:inline-flex"
            >
              <span className="hidden md:inline">เข้าสู่ระบบ</span>
              <User className="h-4 w-4 md:hidden" />
            </Button>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t bg-background/95 backdrop-blur">
          <div className="container py-4 space-y-4">
            {/* Mobile Search */}
            <div className="md:hidden">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('general.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full"
                />
              </form>
            </div>

            {/* Mobile Navigation */}
            <nav className="space-y-2">
              {isAdmin ? (
                <Link
                  to="/admin"
                  className={`block px-3 py-2 text-sm font-medium transition-colors hover:text-primary rounded-md ${
                    location.pathname.startsWith('/admin') ? 'text-primary bg-primary/10' : 'text-muted-foreground'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('nav.admin')}
                </Link>
              ) : (
                <>
                  <Link
                    to="/"
                    className={`block px-3 py-2 text-sm font-medium transition-colors hover:text-primary rounded-md ${
                      isActive('/') ? 'text-primary bg-primary/10' : 'text-muted-foreground'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('nav.home')}
                  </Link>
                  <Link
                    to="/events"
                    className={`block px-3 py-2 text-sm font-medium transition-colors hover:text-primary rounded-md ${
                      isActive('/events') ? 'text-primary bg-primary/10' : 'text-muted-foreground'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('nav.events')}
                  </Link>
                  {user && (
                    <Link
                      to="/my-tickets"
                      className={`block px-3 py-2 text-sm font-medium transition-colors hover:text-primary rounded-md ${
                        isActive('/my-tickets') ? 'text-primary bg-primary/10' : 'text-muted-foreground'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t('nav.myTickets')}
                    </Link>
                  )}
                </>
              )}
            </nav>

            {/* Mobile Language Toggle */}
            <div className="sm:hidden border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">ภาษา / Language</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Globe className="h-4 w-4 mr-2" />
                      {language.toUpperCase()}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setLanguage('th')}>
                      ไทย (Thai)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLanguage('en')}>
                      English
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Mobile Login Button */}
            {!user && (
              <div className="sm:hidden border-t pt-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    navigate('/login');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  เข้าสู่ระบบ
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}