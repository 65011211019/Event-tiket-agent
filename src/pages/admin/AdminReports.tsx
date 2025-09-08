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
        <h1 className="text-3xl font-bold">รายงาน</h1>
        <p className="text-muted-foreground mt-2">
          สถิติและการวิเคราะห์ข้อมูลอีเว้นท์
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายงานถูกรวมไว้ในแดชบอร์ด</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground mb-6">
            ฟีเจอร์รายงานทั้งหมดได้ถูกรวมไว้ในหน้าแดชบอร์ดเพื่อความสะดวกในการใช้งาน
          </p>
          <Button asChild>
            <Link to="/admin">
              ไปยังแดชบอร์ด
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}