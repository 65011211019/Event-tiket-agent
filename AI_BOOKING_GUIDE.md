# AI Booking Function Documentation

## ฟีเจอร์ใหม่: AI จองตั๋วอัตโนมัติ (AI Automatic Booking)

ระบบ AI สามารถช่วยผู้ใช้จองตั๋วโดยอัตโนมัติผ่านการสนทนา พร้อมตัวเลือกในการเลือกอีเว้นท์และประเภทตั๋ว

## การใช้งาน

### 1. การขอให้ AI จองตั๋ว

ผู้ใช้สามารถใช้คำสั่งเหล่านี้:

**คำสั่งทั่วไป:**
- "จองให้หน่อย"
- "ช่วยจอง"
- "จองตั๋ว"
- "AI จอง"
- "จองอัตโนมัติ"

**คำสั่งระบุอีเว้นท์:**
- "จองให้ Digital Marketing"
- "ช่วยจอง Tech Conference"
- "จองตั๋ว Jazz Concert"

### 2. ขั้นตอนการจอง

#### ขั้นตอนที่ 1: AI แสดงตัวเลือกอีเว้นท์
```
🎉 เยี่ยมเลยค่ะ! ดิฉันพร้อมจะช่วยคุณจองตั๋ว 🚀

มีอีเว้นท์ที่น่าสนใจ 5 รายการให้เลือก:

🎫 **Digital Marketing Masterclass 2025**
📅 15 ต.ค. 2568
📍 Queen Sirikit National Convention Center
💰 เริ่มต้น 3,500 บาท
🎫 เหลือ 55 ที่นั่ง

คุณต้องการให้ดิฉันจองอีเว้นท์ไหนคะ? 🤔
```

#### ขั้นตอนที่ 2: เลือกอีเว้นท์
ผู้ใช้สามารถ:
- คลิกปุ่ม "🎫 จองเลย" ในการ์ดอีเว้นท์
- พิมพ์ "จอง Digital Marketing"
- เลือกจากปุ่มแนะนำ

#### ขั้นตอนที่ 3: AI แสดงตัวเลือกตั๋ว
```
🎉 พบอีเว้นท์แล้ว! ดิฉันพร้อมจะช่วยคุณจอง 🚀

🎫 **Digital Marketing Masterclass 2025**
📅 วันเสาร์ที่ 15 ตุลาคม 2568
📍 Queen Sirikit National Convention Center
🎫 เหลือ 55 ที่นั่ง

🎫 **ประเภทตั๋ว:**
1. บัตรนักเรียน/นักศึกษา - **3,500 บาท**
2. บัตรราคาปกติ - **5,500 บาท**
3. บัตร Early Bird - **4,500 บาท**

คุณต้องการตั๋วประเภทไหนคะ? 🤔
```

#### ขั้นตอนที่ 4: เลือกประเภทตั๋ว
ผู้ใช้สามารถ:
- คลิกปุ่ม "เลือก" ในการ์ดตั๋ว
- พิมพ์ "จองบัตรราคาปกติ"
- พิมพ์ "จองตั๋ว VIP"

#### ขั้นตอนที่ 5: ยืนยันและไปหน้าจอง
```
✅ เยี่ยมเลย! กำลังจะพาคุณไปหน้าจองตั๋ว 🎉

🎫 **Digital Marketing Masterclass 2025**
🎫 ประเภทตั๋ว: บัตรราคาปกติ
💰 ราคา: 5,500 บาท

คุณจะสามารถเลือกจำนวนตั๋วและกรอกข้อมูลผู้จองในหน้าถัดไป

กระบวนการจองจะมีขั้นตอนดังนี้:
• เลือกประเภทและจำนวนตั๋ว
• กรอกข้อมูลผู้จอง
• ยืนยันข้อมูล
• ชำระเงิน 💳
```

## คำสั่งที่รองรับ

### คำสั่งการจองทั่วไป
- `จองให้หน่อย`
- `ช่วยจอง`
- `จองตั๋ว`
- `book for me`
- `ai จอง`
- `จองอัตโนมัติ`

### คำสั่งจองอีเว้นท์เฉพาะ
- `จอง [ชื่ออีเว้นท์]`
- `จอง digital marketing`
- `จอง tech conference`
- `จอง jazz concert`
- `จอง marathon`
- `จอง networking`

### คำสั่งเลือกประเภทตั๋ว
- `จองบัตรราคาปกติ`
- `จอง early bird`
- `จองบัตรนักเรียน`
- `จอง vip`
- `จอง premium`
- `จองบัตรทั่วไป`

## Component Architecture

### 1. BookingChoices Component
แสดงรายการอีเว้นท์ที่สามารถจองได้
- Props: `events`, `onEventSelect`
- แสดงข้อมูลอีเว้นท์: ชื่อ, วันที่, สถานที่, ราคา, จำนวนที่เหลือ
- ปุ่มการกระทำ: "จองเลย", "ดูรายละเอียด"

### 2. TicketOptions Component  
แสดงตัวเลือกประเภทตั๋วสำหรับอีเว้นท์ที่เลือก
- Props: `event`, `ticketOptions`, `eventId`
- แสดงข้อมูลอีเว้นท์และตัวเลือกตั๋ว
- ปุ่มการกระทำ: "เลือก" สำหรับแต่ละประเภทตั๋ว

### 3. AI Response Handlers

#### handleAIBookingRequest()
- จัดการคำขอจองทั่วไป
- ค้นหาอีเว้นท์ที่เหมาะสม
- แสดงตัวเลือกอีเว้นท์

#### handleSpecificEventBooking()
- จัดการการจองอีเว้นท์เฉพาะ
- ตรวจสอบความพร้อมของอีเว้นท์
- แสดงตัวเลือกประเภทตั๋ว

#### handleBookingConfirmation()
- จัดการการยืนยันการจอง
- ตรวจสอบการเข้าสู่ระบบ
- นำทางไปหน้าจองตั๋ว

## Technical Implementation

### 1. Input Parsing
```typescript
// ตรวจจับคำขอจองทั่วไป
if (lowerInput.includes('จองให้หน่อย') || lowerInput.includes('ช่วยจอง') || 
    lowerInput.includes('จองตั๋ว') || lowerInput.includes('book for me') ||
    lowerInput.includes('ai จอง') || lowerInput.includes('จองอัตโนมัติ')) {
  return { type: 'ai_booking_request', payload: { eventName: mentionedEvent, originalQuery: input } };
}
```

### 2. Action Types
- `ai_booking_request` - คำขอจองทั่วไป
- `specific_event_booking` - จองอีเว้นท์เฉพาะ
- `confirm_booking` - ยืนยันการจอง
- `show_booking_choices` - แสดงตัวเลือกอีเว้นท์
- `show_ticket_options` - แสดงตัวเลือกตั๋ว
- `proceed_to_booking` - ไปหน้าจอง

### 3. Context Management
```typescript
interface AIContext {
  // ... existing properties
  bookingChoices?: {
    events: any[];
    originalQuery?: string;
  };
  ticketOptions?: {
    event: any;
    ticketOptions: any[];
    eventId: string;
  };
  showBookingInterface?: boolean;
  showTicketSelection?: boolean;
}
```

## User Experience Flow

```mermaid
graph TD
    A[ผู้ใช้: "จองให้หน่อย"] --> B[AI: แสดงรายการอีเว้นท์]
    B --> C[ผู้ใช้: เลือกอีเว้นท์]
    C --> D[AI: แสดงตัวเลือกตั๋ว]
    D --> E[ผู้ใช้: เลือกประเภทตั๋ว]
    E --> F[AI: ยืนยันและนำทาง]
    F --> G[หน้าจองตั๋ว]
    G --> H[กรอกข้อมูลและชำระเงิน]
```

## Benefits

1. **Natural Language Interface** - ผู้ใช้สามารถจองตั๋วผ่านการสนทนาธรรมชาติ
2. **Step-by-Step Guidance** - AI แนะนำผู้ใช้ทีละขั้นตอน
3. **Visual Choices** - แสดงตัวเลือกด้วย UI ที่เข้าใจง่าย
4. **Error Handling** - จัดการกรณีอีเว้นท์เต็มหรือหมดเวลา
5. **Authentication Check** - ตรวจสอบการเข้าสู่ระบบก่อนจอง
6. **Seamless Integration** - เชื่อมต่อกับระบบจองที่มีอยู่

## Example Usage

```
User: "จองให้หน่อย"
AI: แสดงรายการอีเว้นท์ 5 รายการพร้อมตัวเลือก

User: คลิก "จองเลย" หรือ "จอง Digital Marketing"
AI: แสดงตัวเลือกประเภทตั๋วพร้อมราคา

User: คลิก "เลือก" หรือ "จองบัตรราคาปกติ"
AI: ยืนยันและนำทางไปหน้าจอง

Result: ผู้ใช้ถูกนำไปยังหน้าจองตั๋วพร้อมข้อมูลที่เลือกไว้
```

ฟีเจอร์นี้ทำให้การจองตั๋วเป็นเรื่องง่ายและสนุกสำหรับผู้ใช้ ด้วยการใช้ AI เป็นผู้ช่วยที่เข้าใจและตอบสนองความต้องการได้อย่างชาญฉลาด! 🎉🤖