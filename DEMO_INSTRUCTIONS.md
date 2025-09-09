# AI Booking Demo Instructions

## How to Test the New AI Booking Function

### 🚀 Quick Start
1. Run the development server:
   ```bash
   npm run dev
   ```

2. Open the application in your browser
3. Click the AI Chat button (blue circle with chat icon) in bottom-right corner

### 🎯 Test Scenarios

#### Scenario 1: General Booking Request
**Input:** `จองให้หน่อย`
**Expected:** AI shows a list of available events with booking choices

#### Scenario 2: Specific Event Booking  
**Input:** `จอง Digital Marketing`
**Expected:** AI shows ticket options for Digital Marketing event

#### Scenario 3: Ticket Type Selection
**Input:** `จองบัตรราคาปกติ`
**Expected:** AI confirms selection and navigates to booking page

### 📝 Test Commands

**General Booking:**
- จองให้หน่อย
- ช่วยจอง
- จองตั๋ว
- AI จอง
- book for me

**Specific Event Booking:**
- จอง Digital Marketing
- จอง Tech Conference  
- จอง Jazz Concert
- จอง Marathon
- จอง Networking

**Ticket Selection:**
- จองบัตรราคาปกติ
- จอง early bird
- จองบัตรนักเรียน
- จอง vip
- จองบัตร premium

### 🔧 Troubleshooting

If the AI doesn't respond correctly:

1. **Clear the chat** by clicking "ล้าง" button
2. **Try shorter commands** like "จองให้"
3. **Check console** for any errors (F12 → Console)

### 📊 Expected User Flow

```
User: "จองให้หน่อย"
↓
AI: Shows list of 5 events with "จองเลย" buttons
↓
User: Clicks "จองเลย" or types "จอง [EventName]"
↓
AI: Shows ticket options for selected event
↓
User: Clicks "เลือก" or types "จองบัตรราคาปกติ"
↓
AI: Confirms and redirects to booking page
↓
Result: User is on the booking page with pre-selected event
```

### 🎨 UI Components to Look For

1. **BookingChoices Component:**
   - Event cards with title, date, location, price
   - "จองเลย" and "รายละเอียด" buttons
   - "ดูอีเว้นท์ทั้งหมด" and "ยกเลิก" buttons

2. **TicketOptions Component:**
   - Event info header with gradient background
   - Ticket type cards with prices
   - "เลือก" buttons for each ticket type
   - Action buttons at bottom

### 🐛 Known Issues to Check

1. **Type Errors:** If you see TypeScript errors, they should not affect functionality
2. **Navigation:** Booking should redirect to `/events/{id}/booking`
3. **Authentication:** System should check if user is logged in before final booking

### 💡 Demo Tips

1. **Use Thai language** for better results
2. **Try different variations** of the same command
3. **Test the suggestion buttons** - they should work as shortcuts
4. **Check responsive design** on mobile screen sizes

### 📞 Demo Script

For presentation purposes, use this script:

```
1. "สวัสดีครับ" (Get AI attention)
2. "จองให้หน่อย" (Show booking choices)
3. Click "จองเลย" on first event
4. Click "เลือก" on regular ticket
5. Show the final booking page
```

This demonstrates the complete AI booking flow in under 30 seconds! 🎉