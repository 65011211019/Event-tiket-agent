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
    if (searchQuery.trim()) {
      // Always navigate to events page with search query, regardless of current page
      navigate(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      // If empty search, navigate to events page without query
      navigate('/events');
    }
    // Clear search on mobile after search
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-primary to-primary-light shadow-lg hover:from-primary/90 hover:to-primary-light/90 transition-all duration-300">
            <Calendar className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
            EventTicketAgent
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex ml-8 space-x-1">
          {isAdmin ? (
            // Admin เห็นเฉพาะลิงก์ admin
            <Link
              to="/admin"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                location.pathname.startsWith('/admin') 
                  ? 'bg-gradient-to-r from-primary to-primary-light text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {t('nav.admin')}
            </Link>
          ) : (
            // User ปกติเห็นลิงก์ทั่วไป
            <>
              <Link
                to="/"
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive('/') 
                    ? 'bg-gradient-to-r from-primary to-primary-light text-primary-foreground shadow-md' 
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                {t('nav.home')}
              </Link>
              <Link
                to="/events"
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive('/events') 
                    ? 'bg-gradient-to-r from-primary to-primary-light text-primary-foreground shadow-md' 
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                {t('nav.events')}
              </Link>
              {user && (
                <Link
                  to="/my-tickets"
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive('/my-tickets') 
                      ? 'bg-gradient-to-r from-primary to-primary-light text-primary-foreground shadow-md' 
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('general.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full rounded-full border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </form>
        </div>

        {/* Right side controls */}
        <div className="flex items-center space-x-1 md:space-x-2">
          {/* Language Toggle - Hidden on small screens */}
          <div className="hidden sm:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="rounded-full hover:bg-accent">
                  <Globe className="h-4 w-4" />
                  <span className="ml-1 text-xs font-medium hidden md:inline">
                    {language.toUpperCase()}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl shadow-lg bg-popover text-popover-foreground">
                <DropdownMenuItem onClick={() => setLanguage('th')} className="rounded-md hover:bg-accent">
                  ไทย (Thai)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('en')} className="rounded-md hover:bg-accent">
                  English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Theme Toggle */}
          <Button variant="ghost" size="sm" onClick={toggleTheme} className="rounded-full hover:bg-accent">
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
                <Button variant="ghost" size="sm" className="rounded-full hover:bg-accent">
                  <User className="h-4 w-4" />
                  <span className="ml-2 hidden lg:inline">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg bg-popover text-popover-foreground">
                <div className="px-3 py-2 text-sm">
                  <div className="font-semibold">{user.name}</div>
                  <div className="text-muted-foreground text-xs">{user.email}</div>
                </div>
                <DropdownMenuSeparator />
                {isAdmin ? (
                  // Admin เห็นเฉพาะรายการ admin
                  <DropdownMenuItem onClick={() => navigate('/admin')} className="rounded-md hover:bg-accent">
                    <Settings className="mr-2 h-4 w-4" />
                    {t('nav.admin')}
                  </DropdownMenuItem>
                ) : (
                  // User ปกติเห็นรายการทั่วไป
                  <>
                    <DropdownMenuItem onClick={() => navigate('/my-tickets')} className="rounded-md hover:bg-accent">
                      <Calendar className="mr-2 h-4 w-4" />
                      {t('nav.myTickets')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')} className="rounded-md hover:bg-accent">
                      <Settings className="mr-2 h-4 w-4" />
                      {t('nav.settings')}
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="rounded-md text-destructive focus:text-destructive hover:bg-destructive/10">
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
              className="hidden sm:inline-flex rounded-full bg-gradient-to-r from-primary to-primary-light text-primary-foreground hover:from-primary/90 hover:to-primary-light/90 border-0 shadow-md"
            >
              <span className="hidden md:inline">เข้าสู่ระบบ</span>
              <User className="h-4 w-4 md:hidden" />
            </Button>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden rounded-full hover:bg-accent"
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('general.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full rounded-full border focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </form>
            </div>

            {/* Mobile Navigation */}
            <nav className="space-y-2">
              {isAdmin ? (
                <Link
                  to="/admin"
                  className={`block px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    location.pathname.startsWith('/admin') 
                      ? 'bg-gradient-to-r from-primary to-primary-light text-primary-foreground shadow-md' 
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t('nav.admin')}
                </Link>
              ) : (
                <>
                  <Link
                    to="/"
                    className={`block px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      isActive('/') 
                        ? 'bg-gradient-to-r from-primary to-primary-light text-primary-foreground shadow-md' 
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('nav.home')}
                  </Link>
                  <Link
                    to="/events"
                    className={`block px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      isActive('/events') 
                        ? 'bg-gradient-to-r from-primary to-primary-light text-primary-foreground shadow-md' 
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('nav.events')}
                  </Link>
                  {user && (
                    <Link
                      to="/my-tickets"
                      className={`block px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                        isActive('/my-tickets') 
                          ? 'bg-gradient-to-r from-primary to-primary-light text-primary-foreground shadow-md' 
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
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
                    <Button variant="outline" size="sm" className="rounded-full">
                      <Globe className="h-4 w-4 mr-2" />
                      {language.toUpperCase()}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl shadow-lg bg-popover text-popover-foreground">
                    <DropdownMenuItem onClick={() => setLanguage('th')} className="rounded-md hover:bg-accent">
                      ไทย (Thai)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLanguage('en')} className="rounded-md hover:bg-accent">
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
                  className="w-full rounded-full bg-gradient-to-r from-primary to-primary-light text-primary-foreground hover:from-primary/90 hover:to-primary-light/90 border-0"
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