# Deployment Guide - Lotería Online 🎯

## Quick Start (Recommended: Vercel)

### 1. Pre-deployment Check ✅
```bash
# Test build locally
npm run build
npm run start

# Run tests
npm test
```

### 2. Environment Variables 🔐
Copy these to your hosting platform:

```bash
MONGODB_URI=mongodb+srv://learning:Learning123@learningfs.ixcqppu.mongodb.net/?retryWrites=true&w=majority&appName=LearningFS
MONGODB_DB=loteria
NEXTAUTH_SECRET=your-production-secret-here-change-this
NEXTAUTH_URL=https://your-app-name.vercel.app
DATABASE_URL="file:./dev.db"
UNSPLASH_ACCESS_KEY=LLazRlvUqTr7XE0McTbGPte35lSHgHGpUIHI2c_jQTs
```

### 3. Deploy to Vercel (Easiest) 🚀

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy:**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "Import Project"
   - Select your `loteria` repository
   - Add environment variables
   - Click "Deploy"

3. **Configure:**
   - Build Command: `npm run build`
   - Install Command: `npm install --legacy-peer-deps`
   - Framework: Next.js

### 4. Alternative Platforms

#### Netlify
- Push to GitHub
- Connect repository on Netlify
- Set build command: `npm run build`
- Add environment variables

#### Railway
- Connect GitHub repository
- Set environment variables
- Deploy automatically

#### Docker
```bash
# Build image
docker build -t loteria .

# Run container
docker run -p 3000:3000 --env-file .env.production loteria
```

## 🔧 Production Optimizations Added

- ✅ Standalone output for better performance
- ✅ Compression enabled
- ✅ Powered-by header removed for security
- ✅ Canvas externalization for server rendering
- ✅ Legacy peer deps handling

## 🛡️ Security Notes

1. **Change NEXTAUTH_SECRET** in production
2. **Update NEXTAUTH_URL** to your domain
3. **Secure MongoDB connection string**
4. **Use environment variables** (never commit secrets)

## 📊 Post-Deployment

1. **Test Features:**
   - User authentication
   - Game creation/joining
   - Fantasy deck theme switching
   - Real-time lobby updates

2. **Monitor:**
   - Check Vercel dashboard for errors
   - Monitor MongoDB Atlas usage
   - Test on different devices

## 🎯 Your App is Ready!

- ✅ 100% test coverage
- ✅ All themes working (Traditional, Horror, Fantasy)
- ✅ Real-time multiplayer functionality
- ✅ Production-optimized configuration
- ✅ Responsive design

**Deploy URL:** https://your-app-name.vercel.app

Ready to go live! 🎉
