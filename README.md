# ⏳ Time Capsule - Digital Memory Preservation

A production-ready web application for creating digital time capsules that unlock on future dates. Built for hackathons and real-world use.

![Time Capsule](https://img.shields.io/badge/Status-Production%20Ready-success)
![Python](https://img.shields.io/badge/Python-3.11+-blue)
![React](https://img.shields.io/badge/React-18.2-61dafb)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688)

## ✨ Features

### Core Functionality
- 🔐 **Secure Authentication** - Supabase Auth with JWT tokens
- 📦 **Time Capsules** - Create personal or group capsules with future unlock dates
- 🎥 **Rich Media Support** - Upload images, videos, audio, and text files
- 🔒 **Locked State** - Media is hidden and blurred until unlock date
- 👥 **Group Capsules** - Share memories with friends and family
- ⏰ **Automatic Unlocking** - Server-side date validation prevents cheating

### Security & Privacy
- Row-Level Security (RLS) policies in Supabase
- Private storage buckets with signed URLs
- JWT-based authentication
- Server-side unlock validation
- File type and size validation

### User Experience
- 🎨 **Glassmorphism UI** - Modern, beautiful design
- ✨ **Smooth Animations** - Framer Motion powered
- 📱 **Responsive** - Works on mobile, desktop, and VR browsers
- 🥽 **Meta Quest Friendly** - Large buttons, centered UI
- 🌓 **Dark Theme** - Easy on the eyes

## 🏗️ Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   React     │────────▶│   FastAPI    │────────▶│  Supabase   │
│  Frontend   │  HTTP   │   Backend    │  API    │  Database   │
│  (Vercel)   │         │   (Render)   │         │  + Storage  │
└─────────────┘         └──────────────┘         └─────────────┘
```

### Tech Stack

**Frontend:**
- React 18.2 with Vite
- Tailwind CSS for styling
- Framer Motion for animations
- Zustand for state management
- React Router for navigation
- Axios for API calls

**Backend:**
- FastAPI (Python)
- Supabase Python SDK
- JWT authentication
- Pydantic for validation

**Database & Storage:**
- Supabase PostgreSQL
- Row-Level Security (RLS)
- Supabase Storage with signed URLs

**Deployment:**
- Frontend: Vercel
- Backend: Render
- Database: Supabase Cloud

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Supabase account (free)

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/timecapsule.git
cd timecapsule
```

### 2. Setup Supabase
1. Create project at [supabase.com](https://supabase.com)
2. Run SQL from `supabase_schema.sql` in SQL Editor
3. Create storage bucket named `capsule-media` (private)
4. Apply storage policies from `supabase_storage_policies.sql`

### 3. Backend Setup
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

pip install -r requirements.txt

# Copy .env.example to .env and fill in your Supabase credentials
copy .env.example .env

# Run backend
uvicorn app.main:app --reload
```

Backend runs at http://localhost:8000

### 4. Frontend Setup
```bash
cd frontend
npm install

# Copy .env.example to .env and configure
copy .env.example .env

# Run frontend
npm run dev
```

Frontend runs at http://localhost:5173

## 📖 Complete Deployment Guide

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed step-by-step instructions on:
- Setting up Supabase
- Deploying to Render
- Deploying to Vercel
- Testing and troubleshooting

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Capsules
- `POST /api/capsules/` - Create capsule
- `GET /api/capsules/` - Get all user's capsules
- `GET /api/capsules/{id}` - Get specific capsule
- `PUT /api/capsules/{id}` - Update capsule
- `DELETE /api/capsules/{id}` - Delete capsule

### Media
- `POST /api/media/upload/{capsule_id}` - Upload media
- `GET /api/media/{media_id}/url` - Get signed URL
- `DELETE /api/media/{media_id}` - Delete media

Full API documentation available at `/docs` endpoint.

## 📁 Project Structure

```
timecapsule/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app
│   │   ├── config.py            # Configuration
│   │   ├── supabase_client.py   # Supabase connection
│   │   ├── dependencies.py      # Auth dependencies
│   │   ├── schemas.py           # Pydantic models
│   │   ├── routes/
│   │   │   ├── auth.py          # Auth endpoints
│   │   │   ├── capsules.py      # Capsule endpoints
│   │   │   └── media.py         # Media endpoints
│   │   └── services/
│   │       ├── capsule_service.py
│   │       └── unlock_service.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── Procfile                 # Render config
│   └── render.yaml              # Render blueprint
│
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── pages/               # Page components
│   │   ├── services/            # API services
│   │   ├── store/               # Zustand store
│   │   ├── utils/               # Utility functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── vercel.json              # Vercel config
│
├── supabase_schema.sql          # Database schema
├── supabase_storage_policies.sql
├── DEPLOYMENT_GUIDE.md
└── README.md
```

## 🔒 Security Features

1. **Authentication**
   - JWT tokens with expiration
   - Supabase Auth integration
   - Secure password hashing

2. **Authorization**
   - Row-Level Security (RLS) in database
   - Owner and member validation
   - Server-side access control

3. **Storage Security**
   - Private storage buckets
   - Signed URLs with expiration
   - File type and size validation

4. **Unlock Security**
   - Server-side date validation
   - No client-side bypass possible
   - Automatic unlock logic

## 🎨 UI/UX Highlights

- **Glassmorphism Design** - Modern frosted glass effect
- **Dark Gradient Background** - Purple to violet gradient
- **Locked State Visualization** - Blur effect with lock icon
- **Unlock Animation** - Smooth reveal animation
- **Countdown Timer** - Shows time remaining
- **VR-Friendly Layout** - Large buttons, minimal scrolling

## 🧪 Testing

### Manual Testing Checklist
- [ ] User signup and login
- [ ] Create personal capsule
- [ ] Create group capsule
- [ ] Upload image, video, audio files
- [ ] Verify locked state (media hidden)
- [ ] Edit capsule before unlock
- [ ] Delete media before unlock
- [ ] Delete capsule
- [ ] Mobile responsiveness
- [ ] VR browser compatibility

## 🐛 Known Issues & Limitations

- Free tier Render instance may sleep after inactivity (30s cold start)
- Large video files may take time to upload
- Browser compatibility: Modern browsers only (Chrome, Firefox, Safari, Edge)

## 🤝 Contributing

This is a hackathon project, but contributions are welcome!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

Built with ❤️ for preserving memories

## 🙏 Acknowledgments

- Supabase for amazing backend infrastructure
- FastAPI for elegant Python APIs
- React team for incredible frontend library
- Tailwind CSS for beautiful styling
- Framer Motion for smooth animations

---

## 🎉 Ready to Deploy?

Follow the [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for complete deployment instructions.

**Questions?** Open an issue or reach out!

**Good luck with your hackathon! 🚀**
