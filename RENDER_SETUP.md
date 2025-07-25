# Render Deployment Instructions for Loteria Backend

## Quick Setup for Render

### 1. Create Web Service on Render
1. Go to [render.com](https://render.com) and sign in with GitHub
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `Tyketelsen13/loteria`

### 2. Configure Build Settings
```
Name: loteria-backend
Branch: main
Build Command: cp next.config.backend.ts next.config.ts && cp backend-package.json package.json && npm install --legacy-peer-deps && npm run build
Start Command: npm start
```

### 3. Environment Variables
Add these in Render dashboard:
```
MONGODB_URI=mongodb+srv://learning:Learning123@learningfs.ixcqppu.mongodb.net/?retryWrites=true&w=majority&appName=LearningFS
MONGODB_DB=loteria
NEXTAUTH_SECRET=ketelsen00781008172000
IMAGINE_ART_API_KEY=vk-TDB1wnFs2FOKLviGmiHw3JiJQA2Bc2k1wXxLZ6d32t3jbr0y
NODE_ENV=production
PORT=3001
SKIP_DB_VALIDATION=true
```

### 4. Advanced Settings
- **Port**: 3001
- **Health Check Path**: /api/health
- **Auto-Deploy**: Yes

### 5. Deploy
Click "Create Web Service" and wait for deployment.

## Test Your Backend
Once deployed, test these endpoints:
- `https://your-app.onrender.com/api/health` - Health check
- `https://your-app.onrender.com/api/build-info` - Build information

## Next Steps
After backend is running:
1. Note your Render URL
2. Use it for frontend deployment to Vercel
3. Update environment variables accordingly
