# Split Deployment: Vercel + Render Setup Guide

This guide will help you deploy the Loteria app with Vercel (frontend) and Render (backend).

## Benefits of This Setup
- ✅ **Vercel**: Excellent frontend performance, edge caching, automatic deployments
- ✅ **Render**: Full Node.js environment for MongoDB, Canvas, Socket.IO
- ✅ **Separation**: Independent scaling and updates for frontend/backend

## Backend Deployment (Render)

### 1. Create Render Account
- Go to [render.com](https://render.com)
- Sign up/login with GitHub

### 2. Deploy Backend
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `loteria-backend`
   - **Build Command**: `cp next.config.backend.ts next.config.ts && cp backend-package.json package.json && npm ci --legacy-peer-deps && npm run build`
   - **Start Command**: `npm start`
   - **Port**: `3001`

### 3. Set Environment Variables
Add these in Render dashboard:
```
MONGODB_URI=mongodb+srv://learning:Learning123@learningfs.ixcqppu.mongodb.net/?retryWrites=true&w=majority&appName=LearningFS
MONGODB_DB=loteria
NEXTAUTH_SECRET=ketelsen00781008172000
IMAGINE_ART_API_KEY=vk-TDB1wnFs2FOKLviGmiHw3JiJQA2Bc2k1wXxLZ6d32t3jbr0y
NODE_ENV=production
PORT=3001
```

### 4. Deploy
- Click "Deploy"
- Note your backend URL (e.g., `https://loteria-backend.onrender.com`)

## Frontend Deployment (Vercel)

### 1. Prepare Frontend
```bash
# Copy frontend configuration
cp next.config.frontend.ts next.config.ts
cp frontend-package.json package.json
```

### 2. Install Vercel CLI
```bash
npm i -g vercel
```

### 3. Deploy to Vercel
```bash
vercel
```

### 4. Set Environment Variables
In Vercel dashboard, add:
```
BACKEND_URL=https://your-render-backend-url.onrender.com
NEXTAUTH_URL=https://your-vercel-app.vercel.app
NEXTAUTH_SECRET=ketelsen00781008172000
NEXT_PUBLIC_BACKEND_URL=https://your-render-backend-url.onrender.com
```

## Local Development

### Backend (Port 3001)
```bash
cp next.config.backend.ts next.config.ts
cp backend-package.json package.json
npm install
npm run dev
```

### Frontend (Port 3000)
```bash
cp next.config.frontend.ts next.config.ts
cp frontend-package.json package.json
npm install
BACKEND_URL=http://localhost:3001 npm run dev
```

## Testing the Setup

1. **Backend Health**: Visit `https://your-render-url.onrender.com/api/health`
2. **Frontend**: Visit your Vercel URL
3. **API Integration**: Test signup/login functionality
4. **Socket.IO**: Test real-time game features

## Troubleshooting

### CORS Issues
- Ensure `NEXT_PUBLIC_BACKEND_URL` is set correctly
- Check Render backend headers configuration

### Socket.IO Connection
- Verify WebSocket support is enabled on Render
- Check network tab for connection errors

### MongoDB Connection
- Test backend health endpoint
- Verify MongoDB Atlas allows Render IP ranges

## Migration from Railway

To switch from Railway to this setup:
1. Deploy backend to Render first
2. Update frontend environment variables
3. Deploy frontend to Vercel
4. Test all functionality
5. Shut down Railway service

## Cost Comparison

**Render (Backend)**:
- Free tier: 750 hours/month
- Paid: $7/month for always-on

**Vercel (Frontend)**:
- Free tier: 100GB bandwidth
- Paid: $20/month pro features

**Total**: Much more cost-effective than most full-stack platforms!
