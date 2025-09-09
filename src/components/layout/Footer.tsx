import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { useLanguage } from '@/contexts/AppContext';

export default function Footer() {
  const { t } = useLanguage();

  const footerLinks = {
    product: [
      { name: 'ค้นหาอีเว้นท์', href: '/events' },
      { name: 'ตั๋วของฉัน', href: '/my-tickets' },
      { name: 'ศูนย์ช่วยเหลือ', href: '#' },
    ],
    company: [
      { name: 'เกี่ยวกับเรา', href: '#' },
      { name: 'บล็อก', href: '#' },
      { name: 'ติดต่อเรา', href: '#' },
    ],
    legal: [
      { name: 'ข้อกำหนดการใช้งาน', href: '#' },
      { name: 'นโยบายความเป็นส่วนตัว', href: '#' },
      { name: 'นโยบายคืนเงิน', href: '#' },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: '#', color: 'bg-blue-600 hover:bg-blue-700' },
    { icon: Twitter, href: '#', color: 'bg-sky-500 hover:bg-sky-600' },
    { icon: Instagram, href: '#', color: 'bg-pink-600 hover:bg-pink-700' },
    { icon: Linkedin, href: '#', color: 'bg-blue-800 hover:bg-blue-900' },
  ];

  return (
    <footer className="border-t bg-gradient-to-r from-background via-muted/30 to-background backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-primary to-primary-light flex items-center justify-center shadow-lg">
                <Ticket className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                EventTicketAgent
              </span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              แพลตฟอร์มจองตั๋วอีเว้นท์ออนไลน์ที่ง่ายและสะดวก ค้นหาและจองตั๋วสำหรับอีเว้นท์ที่คุณชื่นชอบได้ทันที
            </p>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-4 w-4 mr-3 text-primary" />
                support@EventTicketAgent.com
              </div>
              <div className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                <Phone className="h-4 w-4 mr-3 text-primary" />
                +66 2 123 4567
              </div>
              <div className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                <MapPin className="h-4 w-4 mr-3 text-primary" />
                กรุงเทพมหานคร ประเทศไทย
              </div>
            </div>
            <div className="flex space-x-4 mt-6">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    className={`h-10 w-10 rounded-full flex items-center justify-center text-white transition-all duration-200 ${social.color}`}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold mb-4 text-lg text-primary">ผลิตภัณฑ์</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4 text-lg text-primary">บริษัท</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold mb-4 text-lg text-primary">กฎหมาย</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.href} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold mb-4 text-lg text-primary">ข่าวสาร</h3>
            <p className="text-sm text-muted-foreground mb-4">
              สมัครรับข่าวสารและโปรโมชั่นพิเศษ
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="อีเมลของคุณ"
                className="flex-1 rounded-l-lg border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background text-foreground"
              />
              <button className="bg-gradient-to-r from-primary to-primary-light text-primary-foreground px-4 py-2 rounded-r-lg text-sm font-medium hover:from-primary/90 hover:to-primary-light transition-all duration-200 shadow-md">
                สมัคร
              </button>
            </div>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2024 EventTicketAgent. สงวนลิขสิทธิ์.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="#" className="text-muted-foreground hover:text-primary transition-colors text-sm duration-200">
              ข้อกำหนด
            </Link>
            <Link to="#" className="text-muted-foreground hover:text-primary transition-colors text-sm duration-200">
              ความเป็นส่วนตัว
            </Link>
            <Link to="#" className="text-muted-foreground hover:text-primary transition-colors text-sm duration-200">
              คุกกี้
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}