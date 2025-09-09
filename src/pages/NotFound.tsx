import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home } from 'lucide-react';
import { useLanguage } from '@/contexts/AppContext';

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <div className="space-y-4">
          <AlertCircle className="mx-auto h-16 w-16 text-muted-foreground" />
          <h1 className="text-4xl font-bold tracking-tight">404</h1>
          <p className="text-xl text-muted-foreground">
            {t('notFound.subtitle')}
          </p>
          <p className="text-muted-foreground max-w-md mx-auto">
            {t('notFound.description')}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild>
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              {t('notFound.backHome')}
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/events">
              {t('notFound.browseEvents')}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
