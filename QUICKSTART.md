# ⚡ Quick Start Guide - Time Capsule

Get your Time Capsule app running locally in under 10 minutes!

## 🎯 What You Need

- [ ] Python 3.11 or higher
- [ ] Node.js 18 or higher
- [ ] A Supabase account (create free at [supabase.com](https://supabase.com))
- [ ] VS Code (recommended)

---

## 🚀 5-Minute Local Setup

### Step 1: Setup Supabase (3 minutes)

1. **Create Project**
   - Go to [supabase.com](https://supabase.com) → Sign up/Login
   - Click "New Project"
   - Name: `timecapsule`
   - Set a strong database password (SAVE IT!)
   - Choose region → Create

2. **Get Your Keys**
   - Go to Project Settings → API
   - Copy these 3 values:
     - Project URL
     - `anon` `public` key
     - `service_role` key (click Reveal)
   - Go to Project Settings → API → JWT Settings
   - Copy JWT Secret

3. **Setup Database**
   - Go to SQL Editor
   - Copy entire content from `supabase_schema.sql`
   - Paste and click "Run"

4. **Create Storage**
   - Go to Storage
   - Create new bucket: `capsule-media`
   - Make it PRIVATE (toggle off public)

### Step 2: Start Backend (1 minute)

Open terminal in VS Code:

```powershell
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate it
.\venv\Scripts\activate

# Install packages
pip install -r requirements.txt

# Setup environment
copy .env.example .env
```

Now edit `.env` file and paste your Supabase keys:

```env
SUPABASE_URL=your_project_url
SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret

STORAGE_BUCKET=capsule-media
MAX_FILE_SIZE=52428800
FRONTEND_URL=http://localhost:5173
ENVIRONMENT=development
```

Start backend:
```powershell
uvicorn app.main:app --reload
```

✅ Backend running at http://localhost:8000

### Step 3: Start Frontend (1 minute)

Open NEW terminal:

```powershell
# Navigate to frontend
cd frontend

# Install packages
npm install

# Setup environment
copy .env.example .env
```

Edit frontend `.env`:

```env
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

Start frontend:
```powershell
npm run dev
```

✅ Frontend running at http://localhost:5173

---

## ✅ Test It Out

1. Open http://localhost:5173
2. Click "Sign Up" → Create account
3. Create a new capsule (set unlock date to 5 minutes from now)
4. Upload a photo
5. See it locked with blur effect!

---

## 🐛 Troubleshooting

**Backend won't start?**
```powershell
# Make sure venv is activated (you should see (venv) in terminal)
.\venv\Scripts\activate

# Reinstall packages
pip install -r requirements.txt --force-reinstall
```

**Frontend won't start?**
```powershell
# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules
npm install
```

**Can't connect to API?**
- Check backend is running on port 8000
- Check `VITE_API_URL` in frontend `.env`
- Check browser console for errors

**Supabase errors?**
- Verify all 4 keys are correct in `.env`
- Check SQL was executed successfully
- Verify storage bucket exists

---

## 📚 Next Steps

Once it works locally:

1. ✅ Create multiple capsules
2. ✅ Test all media types (images, videos, audio)
3. ✅ Test on mobile browser
4. 📖 Read [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for production deployment
5. 🚀 Deploy to Render + Vercel

---

## 🎉 You're Ready!

Your Time Capsule app is now running locally. Start building memories!

**Need help?** Check the main [README.md](README.md) or [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

**Questions?** Open an issue on GitHub

Good luck! 🚀
