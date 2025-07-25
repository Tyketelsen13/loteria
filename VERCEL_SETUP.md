# Vercel Frontend Deployment Instructions for Loteria

## Quick Setup for Vercel

### 1. Prepare Your Render Backend URL
First, get your Render backend URL from your deployment:
- Example: `https://loteria-backend.onrender.com`
- Test it works: `https://your-render-url.onrender.com/api/health`

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project"
3. Import your GitHub repository: `Tyketelsen13/loteria`

### 3. Configure Build Settings
```
Framework Preset: Next.js
Build Command: cp next.config.frontend.ts next.config.ts && cp frontend-package.json package.json && npm install --legacy-peer-deps && npm run build
Output Directory: .next
Install Command: npm install --legacy-peer-deps
```

### 4. Environment Variables
Add these in Vercel dashboard:
```
NEXT_PUBLIC_API_URL=https://your-render-backend-url.onrender.com
NEXTAUTH_URL=https://your-vercel-app.vercel.app
NEXTAUTH_SECRET=ketelsen00781008172000
MONGODB_URI=mongodb+srv://learning:Learning123@learningfs.ixcqppu.mongodb.net/?retryWrites=true&w=majority&appName=LearningFS
MONGODB_DB=loteria
NODE_ENV=production
SKIP_DB_VALIDATION=true
```

**Important**: Replace `your-render-backend-url` with your actual Render URL and `your-vercel-app` with your Vercel app name.

### 5. Advanced Settings (Optional)
- **Node.js Version**: 18.x or 20.x
- **Framework**: Next.js
- **Root Directory**: Leave blank (use repository root)

### 6. Deploy
Click "Deploy" and wait for deployment.

## Test Your Frontend
Once deployed, test:
- Main app: `https://your-app.vercel.app`
- Avatar generation should work through your Render backend
- Authentication should work properly

## Troubleshooting

### If API calls fail:
1. Check your `NEXT_PUBLIC_API_URL` environment variable
2. Verify your Render backend is running
3. Check browser network tab for CORS errors

### If authentication fails:
1. Verify `NEXTAUTH_URL` matches your Vercel URL exactly
2. Check `NEXTAUTH_SECRET` is set correctly

## Architecture Summary
- **Frontend**: Vercel (Fast, optimized for Next.js)
- **Backend APIs**: Render (Supports Canvas, MongoDB)
- **Database**: MongoDB Atlas
- **Communication**: API calls from Vercel to Render backend
