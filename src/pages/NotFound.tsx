import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <div className="space-y-4">
          <AlertCircle className="mx-auto h-16 w-16 text-muted-foreground" />
          <h1 className="text-4xl font-bold tracking-tight">404</h1>
          <p className="text-xl text-muted-foreground">
            ขออภัย ไม่พบหน้านี้
          </p>
          <p className="text-muted-foreground max-w-md mx-auto">
            หน้าที่คุณกำลังมองหาอาจถูกลบ ย้าย หรือไม่มีอยู่
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild>
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              กลับไปหน้าหลัก
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/events">
              ดูอีเว้นท์ทั้งหมด
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}