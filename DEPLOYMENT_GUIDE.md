# Time Capsule - Complete Setup & Deployment Guide

## 🎯 Project Overview

A production-ready Time Capsule web application where users create digital time capsules with media that unlock on future dates.

**Tech Stack:**
- **Backend:** FastAPI (Python), Supabase (Auth + Database + Storage)
- **Frontend:** React + Vite, Tailwind CSS, Framer Motion
- **Deployment:** Render (Backend) + Vercel (Frontend)

---

## 📋 Prerequisites

Before starting, ensure you have:
- Python 3.11+ installed
- Node.js 18+ installed
- Git installed
- A Supabase account (free tier works)
- A Render account (free tier works)
- A Vercel account (free tier works)

---

## 🗄️ STEP 1: Supabase Setup

### 1.1 Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new organization (if needed)
4. Click "New Project"
5. Fill in:
   - Name: `timecapsule`
   - Database Password: (generate a strong password - SAVE THIS!)
   - Region: Choose closest to you
6. Click "Create new project" (takes ~2 minutes)

### 1.2 Get API Keys

Once your project is ready:

1. Go to **Project Settings** (gear icon) → **API**
2. Copy and save these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key
   - **service_role** key (click "Reveal" to see it)

3. Go to **Project Settings** → **API** → **JWT Settings**
4. Copy **JWT Secret** (you'll need this)

### 1.3 Create Database Tables

1. Go to **SQL Editor** in Supabase Dashboard
2. Click "New Query"
3. Copy and paste the entire content from `supabase_schema.sql`
4. Click "Run" (or press Ctrl+Enter)
5. Verify success - you should see "Success. No rows returned"

### 1.4 Create Storage Bucket

1. Go to **Storage** in Supabase Dashboard
2. Click "Create a new bucket"
3. Name: `capsule-media`
4. **Public bucket:** Toggle OFF (keep it private)
5. Click "Create bucket"

### 1.5 Set Storage Policies

1. Still in Storage, click on `capsule-media` bucket
2. Go to "Policies" tab
3. Click "New Policy"
4. Click "Create a policy from scratch"
5. Copy and paste the content from `supabase_storage_policies.sql`
6. Run each policy separately

---

## 🔧 STEP 2: Backend Setup (Local Development)

### 2.1 Install Dependencies

```powershell
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\activate

# Install requirements
pip install -r requirements.txt
```

### 2.2 Configure Environment Variables

1. Copy `.env.example` to `.env`:
```powershell
copy .env.example .env
```

2. Open `.env` and fill in your Supabase credentials:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_role_key_here
SUPABASE_JWT_SECRET=your_jwt_secret_here

STORAGE_BUCKET=capsule-media
MAX_FILE_SIZE=52428800

FRONTEND_URL=http://localhost:5173
ENVIRONMENT=development
```

### 2.3 Run Backend Locally

```powershell
# Make sure you're in backend folder with venv activated
uvicorn app.main:app --reload --port 8000
```

Backend should now be running at `http://localhost:8000`
- API docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

---

## 🎨 STEP 3: Frontend Setup (Local Development)

### 3.1 Install Dependencies

```powershell
# Open new terminal and navigate to frontend folder
cd frontend

# Install npm packages
npm install
```

### 3.2 Configure Environment Variables

1. Copy `.env.example` to `.env`:
```powershell
copy .env.example .env
```

2. Open `.env` and configure:
```env
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3.3 Run Frontend Locally

```powershell
npm run dev
```

Frontend should now be running at `http://localhost:5173`

---

## 🧪 STEP 4: Test Locally

1. Open `http://localhost:5173` in your browser
2. Click "Sign Up" and create an account
3. Create a new time capsule
4. Upload some media
5. Check that everything works!

---

## 🚀 STEP 5: Deploy Backend to Render

### 5.1 Push Code to GitHub

```powershell
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit - Time Capsule app"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/yourusername/timecapsule.git
git branch -M main
git push -u origin main
```

### 5.2 Deploy on Render

1. Go to [https://render.com](https://render.com)
2. Sign in with GitHub
3. Click "New +" → "Web Service"
4. Connect your repository
5. Configure:
   - **Name:** `timecapsule-api`
   - **Region:** Choose closest to you
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** `Free`

6. Click "Advanced" and add Environment Variables:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your_anon_key
   SUPABASE_SERVICE_KEY=your_service_role_key
   SUPABASE_JWT_SECRET=your_jwt_secret
   STORAGE_BUCKET=capsule-media
   MAX_FILE_SIZE=52428800
   FRONTEND_URL=https://your-app.vercel.app  (update after Vercel deployment)
   ENVIRONMENT=production
   ```

7. Click "Create Web Service"
8. Wait for deployment (3-5 minutes)
9. Copy your Render URL (e.g., `https://timecapsule-api.onrender.com`)

---

## 🌐 STEP 6: Deploy Frontend to Vercel

### 6.1 Deploy on Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New" → "Project"
4. Import your repository
5. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

6. Add Environment Variables:
   ```
   VITE_API_URL=https://timecapsule-api.onrender.com
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

7. Click "Deploy"
8. Wait for deployment (2-3 minutes)
9. You'll get a URL like `https://timecapsule-xyz.vercel.app`

### 6.2 Update Backend CORS

1. Go back to Render dashboard
2. Update the `FRONTEND_URL` environment variable to your Vercel URL
3. Click "Save Changes" (this will redeploy)

---

## ✅ STEP 7: Final Testing

1. Visit your Vercel URL
2. Test complete flow:
   - ✓ Sign up new account
   - ✓ Create time capsule with future date
   - ✓ Upload media (image, video, audio)
   - ✓ Verify media is locked/blurred
   - ✓ Check dashboard shows capsule
   - ✓ Test logout/login
3. Test on mobile browser
4. Test on different browsers

---

## 📱 STEP 8: Meta Quest / VR Browser Testing

1. Open Meta Quest browser
2. Navigate to your Vercel URL
3. The UI should be VR-friendly with:
   - Large, centered buttons
   - Minimal scrolling
   - Readable text sizes
   - Easy navigation

---

## 🔒 Security Checklist

- [x] Supabase RLS policies enabled
- [x] Private storage bucket
- [x] JWT authentication enforced
- [x] CORS properly configured
- [x] Service role key only in backend
- [x] File upload validation
- [x] Date validation server-side
- [x] Environment variables secured

---

## 🎯 Hackathon Submission Checklist

- [ ] Backend deployed and running
- [ ] Frontend deployed and accessible
- [ ] All features working end-to-end
- [ ] Tested on mobile and desktop
- [ ] Public URL ready to submit
- [ ] Demo video recorded (optional but recommended)
- [ ] GitHub repository is public
- [ ] README.md updated with project info

---

## 🐛 Troubleshooting

### Backend won't start on Render
- Check environment variables are set correctly
- Verify Python version is 3.11+
- Check logs in Render dashboard

### Frontend can't connect to backend
- Verify `VITE_API_URL` is correct
- Check CORS settings in backend
- Check browser console for errors

### Media upload fails
- Verify storage bucket exists and is named `capsule-media`
- Check storage policies are set correctly
- Verify file size is under 50MB

### Authentication not working
- Verify all Supabase keys are correct
- Check JWT secret matches
- Clear browser localStorage and try again

---

## 📚 Additional Resources

- Supabase Docs: https://supabase.com/docs
- FastAPI Docs: https://fastapi.tiangolo.com
- React Docs: https://react.dev
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs

---

## 🎉 Congratulations!

Your Time Capsule app is now live and ready for submission!

**Your URLs:**
- Frontend: https://your-app.vercel.app
- Backend API: https://your-api.onrender.com
- API Docs: https://your-api.onrender.com/docs

Share your public URL and good luck with your hackathon! 🚀
