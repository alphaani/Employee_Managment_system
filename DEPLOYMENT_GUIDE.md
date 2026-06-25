# Deployment Guide

## Architecture Overview

```
Frontend (Vite + React)       Backend (Express + Node.js)
      |                              |
  Vercel.app                   Vercel.app / Render
      |                              |
  axios <--- HTTP/HTTPS --->    API Server
                                    |
                              MongoDB Atlas
```

---

## 1. MongoDB Atlas Setup

1. Go to https://cloud.mongodb.com and create a free cluster
2. Create a database user (username + password)
3. Whitelist all IPs (`0.0.0.0/0`) for development, or restrict to your Vercel IP range
4. Get your connection string:
   ```
   mongodb+srv://<user>:<password>@cluster.xxxxx.mongodb.net/ems?retryWrites=true&w=majority
   ```

---

## 2. Backend Deployment (Vercel)

### Prerequisites
```bash
# Install Vercel CLI
npm i -g vercel
```

### Steps
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Set environment variables in Vercel dashboard:
   ```
   NODE_ENV=production
   MONGODB_URI=<your-atlas-connection-string>
   JWT_SECRET=<random-64-char-string>
   JWT_EXPIRES_IN=24h
   CORS_ORIGIN=https://<frontend-url>.vercel.app
   ```

3. Deploy:
   ```bash
   vercel --prod
   ```

### Alternative: Render.com
1. Create a Web Service on https://render.com
2. Connect your repository
3. Set: Build Command = `npm install`, Start Command = `npm start`
4. Add all environment variables in the dashboard

---

## 3. Frontend Deployment (Vercel)

### Steps
1. Navigate to the frontend directory:
   ```bash
   cd Frontend
   ```

2. Set environment variable in Vercel dashboard:
   ```
   VITE_API_URL=https://<backend-url>.vercel.app/api
   ```

3. Deploy:
   ```bash
   vercel --prod
   ```

### Important
- The `vercel.json` in the Frontend folder handles SPA routing rewrites
- Code splitting is configured via `vite.config.js` manualChunks
- Backend URL must be set as `VITE_API_URL` environment variable

---

## 4. Environment Variables Summary

### Backend (`backend/.env`)
| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `production` or `development` |
| `PORT` | No | Server port (default 5000) |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | JWT signing key (min 32 chars) |
| `JWT_EXPIRES_IN` | No | Token expiry (default `24h`) |
| `CORS_ORIGIN` | Yes | Frontend URL for CORS |
| `CLOUDINARY_CLOUD_NAME` | No | For profile image uploads |
| `CLOUDINARY_API_KEY` | No | For profile image uploads |
| `CLOUDINARY_API_SECRET` | No | For profile image uploads |

### Frontend (`Frontend/.env`)
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Backend API base URL |

---

## 5. Running Locally

```bash
# Install all dependencies
npm run install:all

# Start both frontend and backend concurrently
npm run dev

# Or start them separately:
npm run dev:backend   # Express on :5000
npm run dev:frontend  # Vite on :5173
```

---

## 6. Production Checklist

- [ ] MongoDB Atlas cluster is created and accessible
- [ ] Backend environment variables are set in Vercel/Render
- [ ] Frontend `VITE_API_URL` points to the deployed backend
- [ ] CORS origin matches the frontend domain
- [ ] JWT_SECRET is a strong random string
- [ ] Rate limiting is enabled (default: 100 req/15min per IP)
- [ ] Helmet security headers are enabled
- [ ] Compression (gzip) is enabled
- [ ] Cloudinary is configured if profile uploads are needed
