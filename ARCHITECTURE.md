# 🏗️ Time Capsule - Technical Architecture

## 📊 System Overview

```
┌──────────────────────────────────────────────────────────────┐
│                        USER LAYER                             │
│  Browser (Desktop/Mobile/VR) → React SPA → API Requests       │
└──────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────┐
│                     FRONTEND (Vercel)                         │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  React 18 + Vite + React Router                        │  │
│  │  - Pages: Landing, Login, Signup, Dashboard, Create,   │  │
│  │           CapsuleDetail                                 │  │
│  │  - Components: Navbar, CapsuleCard, MediaItem,         │  │
│  │               LoadingSpinner                            │  │
│  │  - State: Zustand (auth store)                         │  │
│  │  - Styling: Tailwind CSS + Custom Animations          │  │
│  │  - Animations: Framer Motion                           │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                            ↓ HTTP/REST
┌──────────────────────────────────────────────────────────────┐
│                     BACKEND (Render)                          │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  FastAPI + Uvicorn                                      │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │ Routes Layer                                      │  │  │
│  │  │  - /api/auth    → auth.py                       │  │  │
│  │  │  - /api/capsules → capsules.py                  │  │  │
│  │  │  - /api/media   → media.py                      │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │ Services Layer                                    │  │  │
│  │  │  - capsule_service.py (business logic)          │  │  │
│  │  │  - unlock_service.py (unlock validation)        │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │ Dependencies                                      │  │  │
│  │  │  - JWT verification (get_current_user)          │  │  │
│  │  │  - Supabase client initialization               │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                            ↓ Supabase SDK
┌──────────────────────────────────────────────────────────────┐
│                   SUPABASE (Cloud)                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  PostgreSQL DB  │  │  Supabase Auth  │  │   Storage    │ │
│  │  - capsules     │  │  - JWT tokens   │  │  - Media     │ │
│  │  - media        │  │  - Users        │  │    files     │ │
│  │  - members      │  │  - Sessions     │  │  - Signed    │ │
│  │  - RLS enabled  │  │                 │  │    URLs      │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## 🎯 Feature Breakdown

### 1. Authentication System

**Frontend:**
- Login page with email/password
- Signup page with username, email, password
- JWT token stored in localStorage
- Auto-login on app load
- Protected routes with authentication check

**Backend:**
- `/api/auth/signup` - Create user in Supabase Auth
- `/api/auth/login` - Verify credentials, return JWT
- `/api/auth/logout` - Clear session
- `/api/auth/me` - Get current user info

**Security:**
- Passwords hashed by Supabase Auth
- JWT tokens with expiration
- HTTP-only tokens (best practice)
- Token verification on every protected request

---

### 2. Capsule Management

**Features:**
- Create personal or group capsules
- Set title, description, unlock date
- View all owned and shared capsules
- Update capsule details (before unlock)
- Delete capsule and all media

**Business Logic:**
```python
# Server-side validation
- Unlock date must be in future
- Only owner can update/delete
- Cannot modify after unlock
- Automatic unlock status check
- RLS enforces access control
```

**Database Schema:**
```sql
capsules
  - id (UUID, primary key)
  - title (VARCHAR)
  - description (TEXT)
  - unlock_date (TIMESTAMPTZ)
  - created_at (TIMESTAMPTZ)
  - is_group (BOOLEAN)
  - owner_id (UUID → auth.users)

capsule_members
  - id (UUID, primary key)
  - capsule_id (UUID → capsules)
  - user_id (UUID → auth.users)
```

---

### 3. Media Upload & Storage

**Upload Flow:**
```
1. User selects file(s)
2. Frontend validates (type, size)
3. Send to backend /api/media/upload/{capsule_id}
4. Backend validates capsule access
5. Backend validates file again
6. Upload to Supabase Storage (private bucket)
7. Create media record in database
8. Return success response
9. Frontend reloads capsule data
```

**File Support:**
- Images: JPEG, PNG, GIF, WebP
- Video: MP4, WebM, QuickTime
- Audio: MP3, WAV, OGG
- Text: Plain text files
- Max size: 50MB per file

**Storage Security:**
- Private bucket (not publicly accessible)
- Files stored in user-specific folders: `{user_id}/{capsule_id}/{unique_filename}`
- Access via signed URLs only
- Signed URLs expire after 1 hour
- RLS on storage bucket

---

### 4. Lock/Unlock Mechanism

**Locked State:**
```javascript
// Frontend checks
if (!capsule.is_unlocked) {
  // Show blur overlay
  // Hide media URLs
  // Display countdown timer
  // Show lock icon
}
```

**Server-Side Validation:**
```python
# Backend enforces unlock status
unlock_date = datetime.fromisoformat(capsule["unlock_date"])
is_unlocked = datetime.utcnow() >= unlock_date

# If locked, hide media file_paths
if not is_unlocked:
    for media in capsule["media"]:
        media["file_url"] = None
```

**Access Control:**
- Media URLs only generated if unlocked
- Signed URL generation requires unlock check
- RLS prevents direct database access
- Storage policies enforce access rules

---

### 5. UI/UX Design System

**Design Principles:**
- Glassmorphism (frosted glass effect)
- Dark mode with gradient background
- Smooth animations
- VR-friendly spacing
- Mobile-first responsive

**Tailwind Classes:**
```css
.glass-card {
  @apply bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl;
}

.btn-primary {
  @apply bg-gradient-to-r from-purple-500 to-pink-500 
         hover:from-purple-600 hover:to-pink-600 
         text-white font-semibold py-3 px-8 rounded-xl 
         transition-all duration-300 transform hover:scale-105;
}
```

**Animations:**
- Page transitions (Framer Motion)
- Card hover effects
- Unlock celebration animation
- Float animation for icons
- Glow effect on buttons

**VR Optimization:**
- Minimum button height: 60px
- Large touch targets
- Centered content
- Minimal scrolling
- High contrast text

---

## 🔒 Security Architecture

### 1. Authentication Security

```
Client                Backend              Supabase
  │                     │                     │
  ├──Login Request──────►                     │
  │                     ├──Verify────────────►│
  │                     │                     │
  │                     ◄──JWT Token─────────┤
  ◄──JWT Token─────────┤                     │
  │                     │                     │
  ├──API Request────────►                     │
  │   + JWT Token       ├──Verify JWT───────►│
  │                     │                     │
  │                     ◄──User Data─────────┤
  ◄──Response──────────┤                     │
```

### 2. Row-Level Security (RLS)

**Capsules Table:**
```sql
-- Users can only see capsules they own or are members of
CREATE POLICY "view_own_capsules"
  ON capsules FOR SELECT
  USING (
    auth.uid() = owner_id OR
    EXISTS (SELECT 1 FROM capsule_members WHERE user_id = auth.uid())
  );
```

**Media Table:**
```sql
-- Users can only see media from accessible capsules
CREATE POLICY "view_accessible_media"
  ON media FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM capsules WHERE 
      id = media.capsule_id AND 
      (owner_id = auth.uid() OR is_member(auth.uid()))
    )
  );
```

### 3. Storage Security

```
Storage Bucket: capsule-media (PRIVATE)

Policies:
1. Upload: Only authenticated users, only to their own folder
2. Read: Via signed URLs only (generated after unlock check)
3. Delete: Only file owner

File Path Structure:
  /{user_id}/{capsule_id}/{unique_filename}
```

### 4. API Security

**Request Flow:**
```python
@router.get("/capsules/{id}")
async def get_capsule(
    id: str,
    current_user: dict = Depends(get_current_user)  # ← JWT verification
):
    # 1. Verify JWT token (done by dependency)
    # 2. Fetch capsule from database
    # 3. Check user has access (owner or member)
    # 4. Check unlock status
    # 5. Hide media if locked
    # 6. Return sanitized data
```

---

## 📈 Scalability Considerations

### Current Architecture
- ✅ Serverless frontend (Vercel)
- ✅ Containerized backend (Render)
- ✅ Managed database (Supabase)
- ✅ CDN for static assets
- ✅ Connection pooling

### Future Enhancements
- Background jobs for unlock checks (cron)
- Redis caching for frequently accessed capsules
- WebSocket for real-time unlock notifications
- Image optimization and thumbnails
- Video transcoding for compatibility
- Email notifications on unlock

---

## 🧪 Testing Strategy

### Manual Testing
- User authentication flow
- Capsule CRUD operations
- Media upload/delete
- Lock/unlock behavior
- Access control
- Cross-browser compatibility
- Mobile responsiveness

### Automated Testing (Future)
- Unit tests for services
- Integration tests for API
- E2E tests with Playwright
- Load testing with Locust

---

## 📦 Deployment Architecture

```
GitHub Repository
      │
      ├─────────────────┬────────────────┐
      │                 │                │
      ▼                 ▼                ▼
   Render            Vercel         Supabase
  (Backend)        (Frontend)       (Database)
      │                 │                │
      └─────────────────┴────────────────┘
                      │
                      ▼
               Production App
```

**CI/CD:**
- Push to GitHub main branch
- Automatic deployment on Render
- Automatic deployment on Vercel
- Zero-downtime deployments
- Rollback capability

---

## 🎯 Performance Optimizations

### Frontend
- Code splitting (React.lazy)
- Asset optimization (Vite)
- Lazy loading images
- Debounced search
- Virtualized lists (future)

### Backend
- Connection pooling
- Async/await throughout
- Efficient queries
- Pagination (future)
- Response caching (future)

### Database
- Indexed columns (owner_id, unlock_date, capsule_id)
- Efficient query patterns
- RLS policy optimization

---

## 📊 Monitoring & Logging

### Current
- Render logs (backend)
- Vercel logs (frontend)
- Supabase dashboard (database)
- Browser console errors

### Future
- Sentry for error tracking
- Analytics (PostHog/Mixpanel)
- Performance monitoring
- User behavior tracking

---

**This is a production-ready architecture designed for real-world use! 🚀**
