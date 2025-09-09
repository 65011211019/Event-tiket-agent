# EventTicketAgent - ระบบจัดการตั๋วอีเว้นท์

🎫 **แพลตฟอร์มจัดการและจองตั๋วอีเว้นท์ออนไลน์** ที่ออกแบบมาเพื่อให้ผู้จัดงานและผู้เข้าร่วมงานสามารถจัดการอีเว้นท์ได้อย่างมีประสิทธิภาพ

## 🌐 ลิ้งค์สำคัญ

- 🚀 **Demo**: https://event-tiket-agent.vercel.app/
- 📦 **GitHub Repository**: https://github.com/65011211019/Event-tiket-agent

## ✨ คุณสมบัติหลัก

- 🎪 **จัดการอีเว้นท์**: สร้าง แก้ไข และจัดการอีเว้นท์
- 🎟️ **ระบบจองตั๋ว**: เลือกดูและจองตั๋วอีเว้นท์ต่างๆ
- 💳 **ระบบชำระเงิน**: รองรับการชำระเงินผ่าน Omise
- 🤖 **AI ช่วยเหลือ**: แชทบอทและการสร้างภาพตัวอย่างอีเว้นท์
- 📱 **Responsive Design**: รองรับการใช้งานบนมือถือและเดสก์ท็อป
- 🔍 **ระบบค้นหาและกรอง**: ค้นหาอีเว้นท์และกรองตามหมวดหมู่
- 👥 **ระบบผู้ใช้**: แยกสิทธิ์ผู้ใช้ทั่วไปและแอดมิน
- 📊 **แดชบอร์ดแอดมิน**: จัดการอีเว้นท์ ตั๋ว และรายงาน

## 🚀 วิธีการแก้ไขโค้ด

### **ใช้ IDE ที่ชื่นชอบ**

หากต้องการทำงานใน local โดยใช้ IDE ของตัวเอง สามารถ clone repository นี้และ push การเปลี่ยนแปลงได้

ขั้นตอนการติดตั้ง:

```sh
# ขั้นตอนที่ 1: Clone repository โดยใช้ Git URL ของโครงการ
git clone https://github.com/65011211019/Event-tiket-agent.git

# ขั้นตอนที่ 2: เข้าไปในโฟลเดอร์โครงการ
cd Event-tiket-agent

# ขั้นตอนที่ 3: ติดตั้ง dependencies ที่จำเป็น
npm install

# ขั้นตอนที่ 4: เริ่มเซิร์ฟเวอร์พัฒนาพร้อม auto-reloading และ preview แบบทันที
npm run dev
```

## 🛠️ เทคโนโลยีที่ใช้

โครงการนี้พัฒนาด้วย:

- **Frontend Framework**: React 18.3.1 + TypeScript 5.8.3
- **Build Tool**: Vite 5.4.19
- **UI Framework**: Tailwind CSS 3.4.17
- **UI Components**: shadcn-ui
- **Routing**: React Router DOM 6.30.1
- **State Management**: React Context API
- **API Integration**: REST API
- **Payment**: Omise
- **AI Integration**: Google Generative AI API
- **Styling**: PostCSS + Tailwind CSS

## 📁 โครงสร้างโครงการ

```
src/
├── components/          # UI Components
│   ├── admin/          # คอมโพเนนต์แอดมิน
│   ├── auth/           # คอมโพเนนต์การยืนยันตัวตน
│   ├── events/         # คอมโพเนนต์อีเว้นท์
│   ├── layout/         # คอมโพเนนต์เลย์เอาต์
│   └── ui/             # คอมโพเนนต์ UI พื้นฐาน
├── contexts/           # Global State Management
├── hooks/              # Custom Hooks
├── lib/                # Utility Functions และ API
├── pages/              # หน้าเว็บต่างๆ
├── services/           # Business Logic
└── types/              # Type Definitions
```

## 🚀 การ Deploy โครงการ

### การ Deploy แบบอื่นๆ

```sh
# Build สำหรับ production
npm run build

# Preview build
npm run preview
```

## 🌐 การเชื่อมต่อโดเมนที่กำหนดเอง

สามารถเชื่อมต่อโดเมนของตัวเองได้!

เพื่อเชื่อมต่อโดเมน ไปที่ Project > Settings > Domains และคลิก Connect Domain

## 📝 คำสั่ง npm ที่สำคัญ

```sh
npm run dev          # เริ่มเซิร์ฟเวอร์พัฒนา
npm run build        # Build สำหรับ production
npm run preview      # Preview build
npm run lint         # ตรวจสอบโค้ดด้วย ESLint
```

## 👥 การใช้งาน

### สำหรับผู้ใช้ทั่วไป
- เลือกดูและค้นหาอีเว้นท์
- จองและชำระค่าตั๋ว
- จัดการตั๋วของตัวเอง
- ใช้ AI ช่วยเหลือ

### สำหรับแอดมิน
- จัดการอีเว้นท์ทั้งหมด
- ติดตามยอดขายและรายงาน
- จัดการผู้ใช้และสิทธิ์

## 🔐 การเข้าสู่ระบบ

### บัญชีทดสอบ
- **Admin**: admin@tiketagent.com / password123
- **User**: jason@gmail.com / password123

---

💡 **พัฒนาโดย**: egoist Team  
🚀 **Powered by**: egoist.dev
