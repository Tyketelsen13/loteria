# Vercel Environment Variables Setup Guide

## Required Environment Variables for Vercel Dashboard:

Add these in your Vercel project settings under "Environment Variables":

### MongoDB Configuration:
- **Variable Name:** `MONGODB_URI`
- **Value:** `your-mongodb-atlas-connection-string`
- **Environment:** Production, Preview, Development

- **Variable Name:** `MONGODB_DB` 
- **Value:** `loteria`
- **Environment:** Production, Preview, Development

### NextAuth Configuration:
- **Variable Name:** `NEXTAUTH_SECRET`
- **Value:** `your-nextauth-secret-key`
- **Environment:** Production, Preview, Development

- **Variable Name:** `NEXTAUTH_URL`
- **Value:** `https://your-app-name.vercel.app`
- **Environment:** Production, Preview

### Optional API Keys:
- **Variable Name:** `IMAGINE_ART_API_KEY`
- **Value:** `your-imagine-art-api-key`
- **Environment:** Production, Preview, Development

## Deployment Steps:
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Add environment variables in Vercel dashboard with your actual values
4. Deploy!

## Notes:
- Canvas dependency is optional and should work on Vercel Edge Runtime
- MongoDB connections are optimized for serverless environments
- Socket.IO may need additional configuration for Vercel
