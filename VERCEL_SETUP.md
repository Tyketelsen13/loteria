# Vercel Environment Variables Setup Guide

## Required Environment Variables for Vercel Dashboard:

Add these in your Vercel project settings under "Environment Variables":

### MongoDB Configuration:
- **Variable Name:** `MONGODB_URI`
- **Value:** `mongodb+srv://learning:Learning123@learningfs.ixcqppu.mongodb.net/?retryWrites=true&w=majority&appName=LearningFS`
- **Environment:** Production, Preview, Development

- **Variable Name:** `MONGODB_DB` 
- **Value:** `loteria`
- **Environment:** Production, Preview, Development

### NextAuth Configuration:
- **Variable Name:** `NEXTAUTH_SECRET`
- **Value:** `ketelsen00781008172000`
- **Environment:** Production, Preview, Development

- **Variable Name:** `NEXTAUTH_URL`
- **Value:** `https://loteria-phi-taupe.vercel.app/auth/signin` (update with your actual Vercel URL)
- **Environment:** Production, Preview

### Optional API Keys:
- **Variable Name:** `IMAGINE_ART_API_KEY`
- **Value:** `vk-TDB1wnFs2FOKLviGmiHw3JiJQA2Bc2k1wXxLZ6d32t3jbr0y`
- **Environment:** Production, Preview, Development

## Deployment Steps:
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## Notes:
- Canvas dependency is optional and should work on Vercel Edge Runtime
- MongoDB connections are optimized for serverless environments
- Socket.IO may need additional configuration for Vercel
