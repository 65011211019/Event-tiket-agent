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
    <header className="sticky top-0 z-50 w-full border-b bg-gradient-to-r from-blue-50 via-white to-purple-50 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            EventTix
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
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
                  : 'text-muted-foreground hover:bg-blue-100 hover:text-blue-700'
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
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
                    : 'text-muted-foreground hover:bg-blue-100 hover:text-blue-700'
                }`}
              >
                {t('nav.home')}
              </Link>
              <Link
                to="/events"
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive('/events') 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
                    : 'text-muted-foreground hover:bg-blue-100 hover:text-blue-700'
                }`}
              >
                {t('nav.events')}
              </Link>
              {user && (
                <Link
                  to="/my-tickets"
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive('/my-tickets') 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
                      : 'text-muted-foreground hover:bg-blue-100 hover:text-blue-700'
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
              className="pl-10 w-full rounded-full border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
          </form>
        </div>

        {/* Right side controls */}
        <div className="flex items-center space-x-1 md:space-x-2">
          {/* Language Toggle - Hidden on small screens */}
          <div className="hidden sm:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="rounded-full hover:bg-blue-100 text-blue-600">
                  <Globe className="h-4 w-4" />
                  <span className="ml-1 text-xs font-medium hidden md:inline">
                    {language.toUpperCase()}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl shadow-lg border-blue-200">
                <DropdownMenuItem onClick={() => setLanguage('th')} className="rounded-md hover:bg-blue-50 text-blue-700">
                  ไทย (Thai)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('en')} className="rounded-md hover:bg-blue-50 text-blue-700">
                  English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Theme Toggle */}
          <Button variant="ghost" size="sm" onClick={toggleTheme} className="rounded-full hover:bg-purple-100 text-purple-600">
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
                <Button variant="ghost" size="sm" className="rounded-full hover:bg-indigo-100 text-indigo-600">
                  <User className="h-4 w-4" />
                  <span className="ml-2 hidden lg:inline">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg border-indigo-200">
                <div className="px-3 py-2 text-sm">
                  <div className="font-semibold text-indigo-700">{user.name}</div>
                  <div className="text-muted-foreground text-xs">{user.email}</div>
                </div>
                <DropdownMenuSeparator />
                {isAdmin ? (
                  // Admin เห็นเฉพาะรายการ admin
                  <DropdownMenuItem onClick={() => navigate('/admin')} className="rounded-md hover:bg-indigo-50 text-indigo-700">
                    <Settings className="mr-2 h-4 w-4" />
                    {t('nav.admin')}
                  </DropdownMenuItem>
                ) : (
                  // User ปกติเห็นรายการทั่วไป
                  <>
                    <DropdownMenuItem onClick={() => navigate('/my-tickets')} className="rounded-md hover:bg-indigo-50 text-indigo-700">
                      <Calendar className="mr-2 h-4 w-4" />
                      {t('nav.myTickets')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')} className="rounded-md hover:bg-indigo-50 text-indigo-700">
                      <Settings className="mr-2 h-4 w-4" />
                      {t('nav.settings')}
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="rounded-md text-red-600 focus:text-red-600 hover:bg-red-50">
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
              className="hidden sm:inline-flex rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 border-0 shadow-md"
            >
              <span className="hidden md:inline">เข้าสู่ระบบ</span>
              <User className="h-4 w-4 md:hidden" />
            </Button>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden rounded-full hover:bg-blue-100 text-blue-600"
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
        <div className="lg:hidden border-t bg-gradient-to-r from-blue-50 to-purple-50 backdrop-blur">
          <div className="container py-4 space-y-4">
            {/* Mobile Search */}
            <div className="md:hidden">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('general.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full rounded-full border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
                      : 'text-muted-foreground hover:bg-blue-100 hover:text-blue-700'
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
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
                        : 'text-muted-foreground hover:bg-blue-100 hover:text-blue-700'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('nav.home')}
                  </Link>
                  <Link
                    to="/events"
                    className={`block px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      isActive('/events') 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
                        : 'text-muted-foreground hover:bg-blue-100 hover:text-blue-700'
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
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
                          : 'text-muted-foreground hover:bg-blue-100 hover:text-blue-700'
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
                    <Button variant="outline" size="sm" className="rounded-full border-blue-300 text-blue-600">
                      <Globe className="h-4 w-4 mr-2" />
                      {language.toUpperCase()}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl shadow-lg border-blue-200">
                    <DropdownMenuItem onClick={() => setLanguage('th')} className="rounded-md hover:bg-blue-50 text-blue-700">
                      ไทย (Thai)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLanguage('en')} className="rounded-md hover:bg-blue-50 text-blue-700">
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
                  className="w-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 border-0"
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