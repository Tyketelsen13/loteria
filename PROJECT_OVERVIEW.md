# Lotería Online - Project Overview

## 🎮 Project Description
A modern online Lotería (Mexican Bingo) game built with Next.js, featuring real-time multiplayer gameplay, AI-generated avatars, custom card themes, and cross-platform deployment.

## 🏗️ Architecture Overview

### Split Deployment Strategy
- **Frontend**: Deployed on Vercel (Static/Client-side)
- **Backend**: Deployed on Render (Server-side APIs)
- **Database**: MongoDB Atlas (Cloud)
- **Authentication**: JWT tokens (cross-domain compatible)

### Technology Stack
- **Framework**: Next.js 15.4.4 with App Router
- **Language**: TypeScript (fully typed)
- **Styling**: Tailwind CSS
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js + JWT tokens
- **Real-time**: Socket.IO
- **AI Integration**: ImagineArt API for avatar generation
- **Image Processing**: Canvas (server-side)

## 📁 Project Structure

```
lotería/
├── 📱 Frontend Configuration
│   ├── frontend-package.json         # Frontend-specific dependencies
│   ├── next.config.frontend.ts       # Vercel build configuration
│   └── VERCEL_SETUP.md              # Frontend deployment guide
│
├── 🖥️ Backend Configuration  
│   ├── backend-package.json          # Backend-specific dependencies
│   ├── next.config.backend.ts        # Render build configuration
│   └── RENDER_SETUP.md              # Backend deployment guide
│
├── 🎯 Main Application
│   ├── src/
│   │   ├── app/                     # Next.js App Router pages
│   │   │   ├── page.tsx             # Home page
│   │   │   ├── layout.tsx           # Root layout with providers
│   │   │   ├── jwt-signin/          # JWT authentication page
│   │   │   └── api/                 # API routes (used by backend)
│   │   │
│   │   ├── components/              # Reusable UI components
│   │   │   ├── LoteriaBoard.tsx     # Game board component
│   │   │   ├── LoteriaCard.tsx      # Individual card component
│   │   │   ├── ProfileMenu.tsx      # User profile management
│   │   │   └── SettingsMenu.tsx     # Game settings
│   │   │
│   │   ├── context/                 # React Context providers
│   │   │   ├── JWTAuthContext.tsx   # JWT authentication state
│   │   │   └── SettingsContext.tsx  # Game settings state
│   │   │
│   │   ├── lib/                     # Utility libraries
│   │   │   ├── auth.ts              # NextAuth configuration
│   │   │   ├── mongodb.ts           # Database connection
│   │   │   ├── imagineArt.ts        # AI avatar generation
│   │   │   └── gameLogic.ts         # Game rules and validation
│   │   │
│   │   ├── pages/api/               # Additional API endpoints
│   │   │   └── auth/                # Authentication endpoints
│   │   │       ├── jwt-login.ts     # JWT login endpoint
│   │   │       └── jwt-verify.ts    # JWT verification
│   │   │
│   │   └── middleware.ts            # CORS and routing middleware
│   │
├── 🎨 Assets
│   ├── public/
│   │   ├── cards/                   # Traditional Lotería cards
│   │   ├── custom-cards/            # AI-generated custom themes
│   │   └── avatars/                 # User-generated avatars
│   │
├── 🧪 Testing
│   ├── src/__tests__/               # Unit tests
│   ├── jest.config.js               # Testing configuration
│   └── jest.setup.js                # Test environment setup
│
├── 📋 Configuration Files
│   ├── tsconfig.json                # TypeScript configuration
│   ├── tailwind.config.js           # Tailwind CSS configuration
│   ├── next.config.ts               # Default Next.js config
│   └── package.json                 # Main project dependencies
│
└── 📚 Documentation
    ├── PROJECT_OVERVIEW.md          # This file
    ├── DEPLOYMENT_STATUS.md         # Current deployment status
    ├── SPLIT_DEPLOYMENT_GUIDE.md    # Deployment strategy guide
    └── TESTING.md                   # Testing documentation
```

## 🚀 Deployment Status

### ✅ Production URLs
- **Frontend (Vercel)**: `https://loteria-frontend-ten.vercel.app`
- **Backend (Render)**: `https://loteria-backend-aoiq.onrender.com`
- **JWT Authentication**: `https://loteria-frontend-ten.vercel.app/jwt-signin`

### ✅ Working Features
- [x] Split deployment architecture
- [x] Cross-domain JWT authentication
- [x] MongoDB database integration
- [x] AI avatar generation (ImagineArt API)
- [x] CORS configuration for cross-origin requests
- [x] TypeScript compilation (zero errors)
- [x] Automated deployments on git push

### 🔧 Test Credentials
- **Email**: `test@example.com`
- **Password**: `password123`

## 🔄 Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# TypeScript check
npx tsc --noEmit
```

### Deployment Process
1. **Code Changes**: Make changes and commit to `main` branch
2. **Automatic Builds**: 
   - Vercel builds frontend using `frontend-package.json` + `next.config.frontend.ts`
   - Render builds backend using `backend-package.json` + `next.config.backend.ts`
3. **Cross-Domain Setup**: Frontend proxies API calls to backend via rewrites

### Environment Variables

#### Frontend (Vercel)
```env
NEXT_PUBLIC_API_URL=https://loteria-backend-aoiq.onrender.com
NEXTAUTH_URL=https://loteria-backend-aoiq.onrender.com
NEXTAUTH_SECRET=ketelsen00781008172000
MONGODB_URI=mongodb+srv://...
MONGODB_DB=loteria
NODE_ENV=production
SKIP_DB_VALIDATION=true
```

#### Backend (Render)
```env
MONGODB_URI=mongodb+srv://learning:Learning123@learningfs.ixcqppu.mongodb.net/?retryWrites=true&w=majority&appName=LearningFS
MONGODB_DB=loteria
NEXTAUTH_URL=https://loteria-backend-aoiq.onrender.com
NEXTAUTH_SECRET=ketelsen00781008172000
IMAGINE_ART_API_KEY=vk-TDB1wnFs2FOKLviGmiHw3JiJQA2Bc2k1wXxLZ6d32t3jbr0y
NODE_ENV=production
PORT=3001
SKIP_DB_VALIDATION=true
```

## 🎯 Key Implementation Details

### Authentication Strategy
- **JWT Tokens**: Used for cross-domain authentication
- **localStorage**: Token persistence on client
- **API Proxying**: Frontend routes `/api/*` to backend
- **CORS**: Configured for cross-origin requests

### Game Features
- **Multiplayer Support**: Socket.IO real-time communication
- **Custom Themes**: AI-generated card sets
- **Avatar Generation**: ImagineArt AI integration
- **Responsive Design**: Works on desktop and mobile
- **Settings Persistence**: localStorage for user preferences

### Performance Optimizations
- **Split Deployment**: Optimized for each platform's strengths
- **Static Generation**: Frontend pre-rendered where possible
- **External Packages**: Properly externalized for server builds
- **Legacy Peer Deps**: Compatibility with older package versions

## 📝 Next Steps

### Potential Enhancements
- [ ] Real-time multiplayer rooms
- [ ] Voice chat integration
- [ ] Tournament modes
- [ ] Social features (friends, leaderboards)
- [ ] Mobile app development
- [ ] Additional game themes
- [ ] Accessibility improvements

### Maintenance Tasks
- [ ] Monitor deployment health
- [ ] Update dependencies regularly
- [ ] Add more comprehensive testing
- [ ] Performance monitoring
- [ ] User analytics integration

## 🏆 Project Achievements

✅ **Successfully deployed** a complex full-stack application to free hosting platforms
✅ **Resolved cross-domain authentication** challenges with JWT implementation  
✅ **Achieved zero TypeScript errors** across the entire codebase
✅ **Implemented AI features** with image generation capabilities
✅ **Built responsive design** that works across devices
✅ **Created comprehensive documentation** for future maintenance

---

*Last Updated: July 25, 2025*
*Project Status: ✅ Production Ready*
