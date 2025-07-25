#!/bin/bash
# Deploy Backend to Render

echo "Preparing backend deployment..."

# Copy backend configuration
cp next.config.backend.ts next.config.ts
cp backend-package.json package.json
cp .env.backend .env.production

echo "Backend files prepared for Render deployment"
echo "1. Create a new Web Service on Render"
echo "2. Connect your GitHub repository"
echo "3. Set build command: npm run build"
echo "4. Set start command: npm start"
echo "5. Add environment variables from .env.backend"
echo "6. Deploy!"
