# Deployment Instructions: Vercel (Frontend) & Render (Backend)

## 1. Environment Variables

### Frontend (Vercel)
- `NEXT_PUBLIC_SOCKET_URL`: The public URL of your deployed Socket.IO server (Render)
- `NEXT_PUBLIC_API_URL` or `NEXT_PUBLIC_BACKEND_URL`: The public URL of your backend API (Render)

### Backend & Socket Server (Render)
- `PORT`: (Set automatically by Render)
- `CORS_ORIGIN`: The public URL of your frontend (e.g., `https://your-vercel-app.vercel.app`)

## 2. Deploy Backend & Socket Server to Render
- Create two Render web services:
  - **Backend**: Point to `backend/server.js`
  - **Socket Server**: Point to `socket-server.js`
- Set `CORS_ORIGIN` to your Vercel frontend URL in both services.
- Both will use the `PORT` provided by Render automatically.

## 3. Deploy Frontend to Vercel
- Push your code to GitHub (or connect to Vercel).
- Set `NEXT_PUBLIC_SOCKET_URL` and `NEXT_PUBLIC_API_URL` in Vercel project settings to your Render backend/socket URLs.
- Deploy!

## 4. Test
- Open your Vercel frontend URL and verify real-time features work.

---

### Example `.env` for local development

# Frontend
NEXT_PUBLIC_SOCKET_URL=http://localhost:3003
NEXT_PUBLIC_API_URL=http://localhost:3001

# Backend/Socket Server
CORS_ORIGIN=http://localhost:3000

---

For more details, see VERCEL_ENV_SETUP.md and Render docs.
