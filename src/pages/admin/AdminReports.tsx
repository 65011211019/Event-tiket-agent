import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLanguage } from '@/contexts/AppContext';

export default function AdminReports() {
  const { t } = useLanguage();

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t('adminReports.title')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('adminReports.subtitle')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('adminReports.integratedTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground mb-6">
            {t('adminReports.integratedMessage')}
          </p>
          <Button asChild>
            <Link to="/admin">
              {t('adminReports.goToDashboard')}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}