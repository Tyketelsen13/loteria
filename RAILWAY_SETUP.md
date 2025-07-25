# Railway Environment Variables Setup Guide

Follow these steps to complete your Railway deployment:

## 1. Set Environment Variables in Railway Dashboard

Go to: https://railway.com/project/794a8842-751c-48b4-ba8a-bc73520e5451

Add these variables in the Railway dashboard:

```
MONGODB_URI=mongodb+srv://learning:Learning123@learningfs.ixcqppu.mongodb.net/?retryWrites=true&w=majority&appName=LearningFS
MONGODB_DB=loteria
NEXTAUTH_SECRET=ketelsen00781008172000
NEXTAUTH_URL=https://your-railway-app-url.railway.app
IMAGINE_ART_API_KEY=vk-TDB1wnFs2FOKLviGmiHw3JiJQA2Bc2k1wXxLZ6d32t3jbr0y
```

## 2. Deploy Command
After setting variables, deploy with:
```bash
railway up --detach
```

## 3. Your Railway Project
- Dashboard: https://railway.com/project/794a8842-751c-48b4-ba8a-bc73520e5451
- Project Name: loteria-online
- Environment: production

## 4. Features Enabled on Railway:
✅ Socket.IO Real-time multiplayer
✅ Canvas API for image generation  
✅ Persistent file storage for avatars
✅ No timeout limits for AI generation
✅ Full Node.js environment
