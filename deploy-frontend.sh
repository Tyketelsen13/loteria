#!/bin/bash
# Deploy Frontend to Vercel

echo "Preparing frontend deployment..."

# Copy frontend configuration
cp next.config.frontend.ts next.config.ts
cp frontend-package.json package.json

echo "Frontend files prepared for Vercel deployment"
echo "1. Install Vercel CLI: npm i -g vercel"
echo "2. Run: vercel"
echo "3. Set environment variables from .env.frontend"
echo "4. Update BACKEND_URL to your Render backend URL"
echo "5. Deploy!"
