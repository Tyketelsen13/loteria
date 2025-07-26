# CORS Error Fix Summary

## Problem
The Lotería application was experiencing CORS errors when the frontend (Vercel) tried to communicate with the backend (Render):

```
Access to fetch at 'https://loteria-backend-aoiq.onrender.com/api/auth/session' from origin 'https://loteria-frontend-ten.vercel.app' has been blocked by CORS policy
```

## Root Causes
1. **Incorrect Environment Variables**: The `.env.frontend` file had placeholder URLs instead of actual deployment URLs
2. **Incomplete CORS Configuration**: The server was missing proper CORS headers for NextAuth session requests
3. **Socket.IO CORS**: Too permissive wildcard CORS settings needed to be more specific

## Fixes Applied

### 1. Server-Side CORS Headers (`server.js`)
Added comprehensive CORS middleware to the custom Next.js server:

```javascript
// Add CORS headers for all requests
const allowedOrigins = [
  'https://loteria-frontend-ten.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
  'https://loteria-backend-aoiq.onrender.com'
];

const origin = req.headers.origin;
if (allowedOrigins.includes(origin)) {
  res.setHeader('Access-Control-Allow-Origin', origin);
}

res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
res.setHeader('Access-Control-Allow-Credentials', 'true');
res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

// Handle preflight requests
if (req.method === 'OPTIONS') {
  res.writeHead(200);
  res.end();
  return;
}
```

### 2. Socket.IO CORS Configuration
Updated Socket.IO to use specific origins instead of wildcard:

```javascript
const io = new Server(server, {
  path: "/api/socket/io",
  cors: {
    origin: [
      "https://loteria-frontend-ten.vercel.app",
      "http://localhost:3000",
      "http://localhost:3001",
      "https://loteria-backend-aoiq.onrender.com"
    ],
    methods: ["GET", "POST"],
    credentials: true,
    allowEIO3: true
  },
});
```

### 3. Environment Variables Fixed
Updated `.env.frontend` with correct URLs:

```bash
BACKEND_URL=https://loteria-backend-aoiq.onrender.com
NEXTAUTH_URL=https://loteria-frontend-ten.vercel.app
NEXTAUTH_SECRET=ketelsen00781008172000
NODE_ENV=production
```

### 4. Next.js Configuration Updates
Enhanced CORS headers in `next.config.ts`:

```typescript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: 'https://loteria-frontend-ten.vercel.app' },
        { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
        { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, Cookie, next-auth.csrf-token, next-auth.callback-url, next-auth.session-token' },
        { key: 'Access-Control-Allow-Credentials', value: 'true' },
      ],
    },
  ]
},
```

### 5. Middleware Enhancement
Updated `src/middleware.ts` to include backend origin in allowed origins list.

### 6. Production Environment
Created comprehensive `.env.production.local` with all necessary variables.

## Deployment Steps Required

### Backend (Render)
1. Push the updated `server.js` with CORS fixes
2. Ensure environment variables are set correctly in Render dashboard
3. Redeploy the backend service

### Frontend (Vercel)
1. Update environment variables in Vercel dashboard:
   - `NEXTAUTH_URL=https://loteria-frontend-ten.vercel.app`
   - `NEXTAUTH_SECRET=ketelsen00781008172000`
   - `NEXT_PUBLIC_API_URL=https://loteria-backend-aoiq.onrender.com`
2. Push the updated configuration files
3. Redeploy the frontend

## Testing
After deployment, test:
1. User authentication/login
2. Socket.IO multiplayer connections
3. API calls between frontend and backend
4. Cross-origin requests are working without CORS errors

## Key Files Modified
- `server.js` - Added CORS middleware
- `.env.frontend` - Updated URLs
- `.env.production.local` - Added production variables
- `next.config.ts` - Enhanced CORS headers
- `src/middleware.ts` - Added backend origin
- iOS improvements (previous work)

The CORS errors should be resolved once these changes are deployed to both Vercel and Render.
