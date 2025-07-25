# Railway Deployment - GitHub Integration Method

## ✅ What We've Fixed:
1. ✅ Removed `output: 'standalone'` from next.config.ts (causes Railway issues)
2. ✅ Updated Dockerfile with Canvas dependencies 
3. ✅ Created nixpacks.toml for proper Node.js setup
4. ✅ Updated railway.toml configuration
5. ✅ Pushed changes to GitHub

## 🚀 Deploy via GitHub Integration:

### Step 1: Open Railway Dashboard
https://railway.com/project/794a8842-751c-48b4-ba8a-bc73520e5451

### Step 2: Add GitHub Service
1. Click "Add Service" → "GitHub Repo"
2. Select "Tyketelsen13/loteria" 
3. Choose "main" branch
4. Railway will automatically start building

### Step 3: Set Environment Variables
In Railway Dashboard → Settings → Variables:
```
MONGODB_URI=mongodb+srv://learning:Learning123@learningfs.ixcqppu.mongodb.net/?retryWrites=true&w=majority&appName=LearningFS
MONGODB_DB=loteria
NEXTAUTH_SECRET=ketelsen00781008172000
NEXTAUTH_URL=https://loteria-online-production.up.railway.app
IMAGINE_ART_API_KEY=vk-TDB1wnFs2FOKLviGmiHw3JiJQA2Bc2k1wXxLZ6d32t3jbr0y
```

### Step 4: Monitor Build
- Railway will use your nixpacks.toml configuration
- Canvas dependencies will be automatically installed
- Build should complete without the standalone error

## 📋 Build Configuration Applied:
- ✅ Node.js 20 environment
- ✅ Canvas dependencies (Cairo, Pango, etc.)
- ✅ Standard Next.js build (no standalone)
- ✅ Proper health check endpoint
- ✅ Socket.IO compatible configuration

Once deployed via GitHub, your Lotería app will have:
🎮 Real-time multiplayer with Socket.IO
🎨 Working Canvas API for avatar generation
💾 Persistent file storage
⚡ No timeout limits for AI generation
