import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Mail, Lock, Eye, EyeOff, Ticket, Users, MapPin, Star, Music, Camera, Gift, Heart } from 'lucide-react';
import { useAuth, useLanguage } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';
import Header from '@/components/layout/Header';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, user } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);

  const from = location.state?.from?.pathname || '/';

  React.useEffect(() => {
    if (user) {
      const destination = user.role === 'admin' ? '/admin' : from;
      navigate(destination, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast({
        title: t('login.validation.loginSuccess'),
        description: t('login.validation.loginSuccessDesc'),
      });
    } catch (error) {
      toast({
        title: t('login.validation.loginFailed'),
        description: t('login.validation.loginFailedDesc'),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden bg-background">
        {/* Animated decorative background elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-10 left-10 text-primary/10 animate-bounce animation-delay-1000">
            <Ticket className="w-24 h-24" />
          </div>
          <div className="absolute bottom-20 right-10 text-primary/10 animate-bounce animation-delay-2000">
            <Users className="w-32 h-32" />
          </div>
          <div className="absolute top-1/3 right-1/4 text-primary/5 animate-bounce animation-delay-3000">
            <MapPin className="w-40 h-40" />
          </div>
          <div className="absolute bottom-1/4 left-1/3 text-primary/5 animate-bounce animation-delay-1500">
            <Star className="w-20 h-20" />
          </div>
          <div className="absolute top-1/4 right-1/3 text-primary/10 animate-bounce animation-delay-2500">
            <Calendar className="w-28 h-28" />
          </div>
          {/* Additional icons */}
          <div className="absolute top-1/2 left-20 text-primary/5 animate-bounce animation-delay-1200">
            <Music className="w-20 h-20" />
          </div>
          <div className="absolute bottom-40 left-20 text-primary/10 animate-bounce animation-delay-1800">
            <Camera className="w-24 h-24" />
          </div>
          <div className="absolute top-20 right-1/2 text-primary/5 animate-bounce animation-delay-2200">
            <Gift className="w-28 h-28" />
          </div>
          <div className="absolute bottom-20 left-1/2 text-primary/10 animate-bounce animation-delay-2800">
            <Heart className="w-20 h-20" />
          </div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-primary/5 blur-2xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-40 h-40 rounded-full bg-primary/5 blur-2xl animate-pulse animation-delay-1000"></div>
        </div>
        
        <Card className="w-full max-w-4xl z-10 shadow-2xl border-0 bg-card/90 backdrop-blur-sm rounded-3xl overflow-hidden transform transition-all duration-300 hover:scale-[1.01]">
          {/* Decorative top border */}
          <div className="h-2 w-full bg-primary"></div>
          
          <div className="flex flex-col lg:flex-row">
            {/* Left side - Decorative panel */}
            <div className="w-full lg:w-2/5 bg-primary p-8 flex flex-col justify-center items-center text-primary-foreground relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-white/10 blur-2xl"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl"></div>
              
              <div className="relative z-10 text-center space-y-6">
                <div className="flex justify-center">
                  <Link to="/" className="flex items-center space-x-3">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl shadow-lg hover:scale-105 transition-all duration-300 overflow-hidden">
                      <img 
                        src="/tiket.png" 
                        alt="EventTicketAgent Logo" 
                        className="h-20 w-20 rounded-2xl object-cover"
                      />
                    </div>
                  </Link>
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2">{t('login.welcome.title')}</h2>
                  <p className="text-primary-foreground/90">{t('login.welcome.subtitle')}</p>
                </div>
                <div className="pt-4 border-t border-primary-foreground/20">
                  <p className="text-sm text-primary-foreground/80">{t('login.welcome.description')}</p>
                </div>
              </div>
            </div>
            
            {/* Right side - Login form */}
            <div className="w-full lg:w-3/5 p-8 relative">
              {/* Decorative elements inside the form panel */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-xl -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full blur-xl translate-y-12 -translate-x-12"></div>
              
              <CardHeader className="text-center pb-6 pt-4 relative">
                <CardTitle className="text-2xl font-bold text-primary">{t('login.title')}</CardTitle>
                <p className="text-sm text-muted-foreground mt-2">{t('login.subtitle')}</p>
              </CardHeader>
              
              <CardContent className="pb-6 relative">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-primary" />
                      {t('login.email')}
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('login.emailPlaceholder')}
                        required
                        className="pl-12 py-6 rounded-xl border border-input focus:border-primary focus:ring-2 focus:ring-ring transition-all text-base shadow-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium flex items-center">
                      <Lock className="w-4 h-4 mr-2 text-primary" />
                      {t('login.password')}
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t('login.passwordPlaceholder')}
                        required
                        className="pl-12 pr-12 py-6 rounded-xl border border-input focus:border-primary focus:ring-2 focus:ring-ring transition-all text-base shadow-sm"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute inset-y-0 right-0 flex items-center pr-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                        ) : (
                          <Eye className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground py-6 rounded-xl font-medium text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:bg-primary/90"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <span className="h-5 w-5 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin mr-2"></span>
                        {t('login.loggingIn')}
                      </span>
                    ) : t('login.loginButton')}
                  </Button>
                </form>
                
                <div className="mt-8 pt-6 border-t border-border">
                  <div className="text-center text-sm text-muted-foreground mb-3 flex items-center justify-center">
                    <Star className="w-4 h-4 mr-2 text-yellow-500" />
                    {t('login.testAccounts.title')}
                    <Star className="w-4 h-4 ml-2 text-yellow-500" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-muted/50 rounded-xl p-4 transition-all duration-300 hover:bg-muted/80 hover:shadow-md border border-border">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="h-3 w-3 rounded-full bg-primary"></div>
                        <span className="font-medium text-sm">{t('login.testAccounts.admin')}</span>
                      </div>
                      <div className="text-xs space-y-1">
                        <div className="font-mono bg-background/50 p-2 rounded-lg">{t('login.testAccounts.adminEmail')}</div>
                        <div className="font-mono bg-background/50 p-2 rounded-lg">{t('login.testAccounts.password')}</div>
                      </div>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-4 transition-all duration-300 hover:bg-muted/80 hover:shadow-md border border-border">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="h-3 w-3 rounded-full bg-primary"></div>
                        <span className="font-medium text-sm">{t('login.testAccounts.user')}</span>
                      </div>
                      <div className="text-xs space-y-1">
                        <div className="font-mono bg-background/50 p-2 rounded-lg">{t('login.testAccounts.userEmail')}</div>
                        <div className="font-mono bg-background/50 p-2 rounded-lg">{t('login.testAccounts.password')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </div>
        </Card>
        
        {/* Custom animations */}
        <style>{`
          @keyframes bounce {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-20px);
            }
          }
          .animate-bounce {
            animation: bounce 3s infinite;
          }
          .animation-delay-1000 {
            animation-delay: 1s;
          }
          .animation-delay-1200 {
            animation-delay: 1.2s;
          }
          .animation-delay-1500 {
            animation-delay: 1.5s;
          }
          .animation-delay-1800 {
            animation-delay: 1.8s;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-2200 {
            animation-delay: 2.2s;
          }
          .animation-delay-2500 {
            animation-delay: 2.5s;
          }
          .animation-delay-2800 {
            animation-delay: 2.8s;
          }
          .animation-delay-3000 {
            animation-delay: 3s;
          }
        `}</style>
      </div>
    </div>
  );
}
