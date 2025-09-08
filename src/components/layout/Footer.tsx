import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/AppContext';

export default function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-card">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                EventTix
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('footer.description') || 'แพลตฟอร์มจองตั๋วอีเว้นท์ออนไลน์ที่ดีที่สุดในประเทศไทย'}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">{t('footer.quickLinks') || 'ลิงก์ด่วน'}</h4>
            <div className="space-y-2">
              <Link to="/events" className="block text-sm text-muted-foreground hover:text-primary">
                {t('nav.events')}
              </Link>
              <Link to="/categories" className="block text-sm text-muted-foreground hover:text-primary">
                {t('nav.categories')}
              </Link>
              <Link to="/help" className="block text-sm text-muted-foreground hover:text-primary">
                {t('nav.help')}
              </Link>
              <Link to="/about" className="block text-sm text-muted-foreground hover:text-primary">
                {t('footer.about') || 'เกี่ยวกับเรา'}
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">{t('footer.support') || 'ช่วยเหลือ'}</h4>
            <div className="space-y-2">
              <Link to="/contact" className="block text-sm text-muted-foreground hover:text-primary">
                {t('footer.contact') || 'ติดต่อเรา'}
              </Link>
              <Link to="/faq" className="block text-sm text-muted-foreground hover:text-primary">
                {t('footer.faq') || 'คำถามที่พบบ่อย'}
              </Link>
              <Link to="/terms" className="block text-sm text-muted-foreground hover:text-primary">
                {t('footer.terms') || 'ข้อกำหนดการใช้งาน'}
              </Link>
              <Link to="/privacy" className="block text-sm text-muted-foreground hover:text-primary">
                {t('footer.privacy') || 'นโยบายความเป็นส่วนตัว'}
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">{t('footer.contact') || 'ติดต่อเรา'}</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>support@eventtix.com</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+66 2 xxx xxxx</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Bangkok, Thailand</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {currentYear} EventTix. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary">
                {t('footer.terms') || 'ข้อกำหนด'}
              </Link>
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary">
                {t('footer.privacy') || 'ความเป็นส่วนตัว'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}