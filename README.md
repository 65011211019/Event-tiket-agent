# 🎫 EventTicketAgent - Event Ticket Management System

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.19-yellow.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-blue.svg)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black.svg)](https://vercel.com)

**A comprehensive event ticket management platform** designed to streamline event creation, ticket booking, and management for both organizers and attendees.

## 🌐 Live Demo

- 🚀 **Live Application**: [https://event-tiket-agent.vercel.app/](https://event-tiket-agent.vercel.app/)
- 📦 **GitHub Repository**: [https://github.com/65011211019/Event-tiket-agent](https://github.com/65011211019/Event-tiket-agent)

## ✨ Key Features

### 🎪 Event Management
- Create, edit, and manage events with rich details
- Real-time event status tracking
- Category-based event organization
- Interactive event maps and location services

### 🎟️ Ticket System
- Multiple ticket types per event (VIP, Regular, Student, etc.)
- Real-time ticket availability
- QR code generation for ticket validation
- Comprehensive ticket history and management

### 💳 Payment Integration
- Secure payment processing via Omise
- Multiple payment methods support
- Automated payment confirmation
- Transaction history and receipts

### 🤖 AI-Powered Features
- AI chat assistant for event recommendations
- Automated event preview image generation
- Smart booking suggestions
- Intelligent event categorization

### 📱 User Experience
- Fully responsive design for all devices
- Multi-language support (English/Thai)
- Dark/Light theme support
- Intuitive user interface with shadcn/ui components

### 🔍 Advanced Search & Filtering
- Real-time event search
- Category-based filtering
- Date range filtering
- Location-based event discovery

### 👥 User Management
- Role-based access control (Admin/User)
- Secure authentication system
- User profile management
- Personalized event recommendations

### 📊 Admin Dashboard
- Comprehensive analytics and reporting
- Real-time event and ticket statistics
- Revenue tracking and financial reports
- User management and permissions

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/65011211019/Event-tiket-agent.git
   cd Event-tiket-agent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment file
   cp .env.example .env

   # Configure your environment variables
   # Add your API keys, database URLs, etc.
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:5173
   ```

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1** - Modern React with hooks and concurrent features
- **TypeScript 5.8.3** - Type-safe JavaScript
- **Vite 5.4.19** - Fast build tool and dev server
- **React Router DOM 6.30.1** - Client-side routing

### UI & Styling
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **shadcn/ui** - Modern UI components built on Radix UI
- **Lucide React** - Beautiful icon library
- **PostCSS** - CSS processing tool

### State Management & Data
- **React Context API** - Global state management
- **TanStack Query** - Powerful data synchronization
- **Axios** - HTTP client for API calls

### Maps & Location
- **Leaflet** - Interactive maps
- **React Leaflet** - React components for Leaflet

### Payment & External Services
- **Omise** - Payment processing
- **Google Generative AI** - AI-powered features
- **Cloudinary** - Image hosting and optimization

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Type checking
- **Vite** - Build tool and dev server

## 📁 Project Structure

```
src/
├── components/              # Reusable UI components
│   ├── admin/              # Admin-specific components
│   ├── ai/                 # AI-powered components
│   ├── auth/               # Authentication components
│   ├── events/             # Event-related components
│   ├── layout/             # Layout components
│   ├── maps/               # Map components
│   ├── payment/            # Payment components
│   ├── tickets/            # Ticket components
│   └── ui/                 # Base UI components
├── contexts/               # React Context providers
├── hooks/                  # Custom React hooks
├── i18n/                   # Internationalization files
│   ├── en/                 # English translations
│   └── th/                 # Thai translations
├── lib/                    # Utility functions and configurations
├── pages/                  # Page components
│   ├── admin/              # Admin pages
│   └── ...                 # Other pages
├── services/               # Business logic and API services
├── types/                  # TypeScript type definitions
└── utils/                  # Helper functions
```

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Code Quality
npm run type-check   # Run TypeScript type checking
npm run format       # Format code with Prettier
```

## 🔐 Authentication

### Test Accounts

**Admin Account:**
- Email: `admin@tiketagent.com`
- Password: `password123`

**Regular User Account:**
- Email: `jason@gmail.com`
- Password: `password123`

## 🌐 Internationalization

The application supports multiple languages:

- **English (en)** - Default language
- **Thai (th)** - Thai language support

Language files are located in `src/i18n/` directory.

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

### Manual Deployment

```bash
# Build the application
npm run build

# The build artifacts will be stored in the `dist/` directory
# Deploy the contents of the `dist/` directory to your hosting service
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📊 Performance

- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices, SEO)
- **Bundle Size**: Optimized with code splitting
- **Image Optimization**: Automatic image compression via Cloudinary
- **Caching**: Intelligent caching strategies

## 🔒 Security

- Secure authentication with JWT tokens
- HTTPS encryption for all data transmission
- Input validation and sanitization
- CSRF protection
- Rate limiting for API endpoints

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

**Developed by**: egoist Team
**Powered by**: [egoist.dev](https://egoist.dev)

## 📞 Support

For support, email support@eventticketagent.com or join our Discord community.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [React](https://reactjs.org/) for the amazing framework
- [Vite](https://vitejs.dev/) for fast development experience

---

⭐ **Star this repository** if you find it helpful!
🔗 **Follow for updates** on new features and improvements.
