# Lotería Game - Quick Deployment Guide

## 🚨 Current Issue: API Routes Return 404 on Vercel

The issue was caused by `output: 'standalone'` in `next.config.ts` which interferes with Vercel's API route handling.

## ✅ Fixes Applied

1. **Removed** `output: 'standalone'` from `next.config.ts`
2. **Simplified** `vercel.json` configuration
3. **Added** test page at `/api/test-page` for easier debugging

## 🚀 Deploy Steps

### Option 1: Quick Fix (Recommended)
1. **Install Git**: Download from https://git-scm.com/download/win
2. **Open PowerShell** in your project folder
3. **Run these commands**:
```bash
git init
git add .
git commit -m "Fix API routes deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/loteria-game.git
git push -u origin main
```

### Option 2: Manual Upload
1. **Zip your project** folder
2. **Create new GitHub repository**
3. **Upload files** through GitHub web interface
4. **Connect to Vercel**

## 🧪 Testing After Deployment

Visit these URLs on your Vercel deployment:

1. **Test Page**: `https://your-app.vercel.app/api/test-page`
   - Should show a testing interface
   - Click "Test MongoDB Connection"
   - Click "Test Signup"

2. **Direct API Tests**:
   - `GET /api/test-vercel-mongo` - Should return MongoDB test results
   - `POST /api/auth/signup-simple` - Should accept signup data

## 📊 Expected Results

After the fix:
- ✅ API routes should be accessible (no more 404s)
- ✅ MongoDB connection should work in production
- ✅ Signup endpoints should process requests properly

## 🔍 If Still Having Issues

1. Check Vercel build logs for errors
2. Verify all files are uploaded to GitHub
3. Try the test page first: `/api/test-page`

The main fix was removing the `standalone` output mode that was preventing API routes from being properly deployed to Vercel's serverless functions.
