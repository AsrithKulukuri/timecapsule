# Resend Email Setup Guide

## Step 1: Create Resend Account
1. Go to https://resend.com
2. Sign up with your email
3. Verify your email

## Step 2: Get API Key
1. In Resend dashboard, go to **API Keys** (left sidebar)
2. Click **Create API Key**
3. Name it: `Time Capsule API`
4. Copy the key (starts with `re_`)
5. **Save it safely** - you'll need it in `.env`

## Step 3: Verify Domain (Almost Done!)
1. Go to **Domains** → **Add Domain**
2. Enter your domain (e.g., `yourdomain.com`)
3. Resend shows DNS records to add (like the screenshot you shared)
4. Go to your domain provider (GoDaddy, Namecheap, etc.) and add these DNS records:
   - **DKIM**: TXT record with the resend._domainkey value
   - **SPF**: TXT or MX record for sending
   - **DMARC**: Optional TXT record for receiving

5. After DNS propagates (5-30 min), click the verification button in Resend
6. Once verified, note your verified domain email format

## Step 4: Generate NOTIFY_SECRET
Run this in PowerShell:
```powershell
$secret = [guid]::NewGuid().ToString()
Write-Host "NOTIFY_SECRET=$secret"
```
Copy the output.

## Step 5: Update Backend .env
Open `backend/.env` and add/update:

```env
# === EMAIL (RESEND) ===
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM=Time Capsule <noreply@yourdomain.com>

# === NOTIFICATIONS ===
NOTIFY_SECRET=your_notify_secret_here
NOTIFY_WINDOW_HOURS=24
```

**Important Notes:**
- Replace `re_your_api_key_here` with your actual API key from Step 2
- Replace `yourdomain.com` with your verified domain from Step 3
- Replace `your_notify_secret_here` with the output from Step 4
- `NOTIFY_WINDOW_HOURS=24` means send reminders 24 hours before unlock

## Step 6: Test Locally
1. Start backend: `uvicorn app.main:app --reload`
2. Create a capsule in the UI
3. Check backend logs - you should see email sending (if configured) or skip log (if not configured)

## Step 7: Deploy to Render
1. Go to **Render.com** → Your Time Capsule service
2. Click **Environment** tab
3. Add these env vars:
   - `RESEND_API_KEY`: Your API key
   - `RESEND_FROM`: Your verified email
   - `NOTIFY_SECRET`: Your notify secret
   - `NOTIFY_WINDOW_HOURS`: 24
4. Redeploy

## Step 8: Setup Cron Job (Optional but Recommended)
To send reminders automatically, create a cron job that calls `/api/notify/reminders`.

### Option A: Render Cron (Recommended)
1. In Render, go to **Cron Jobs** → **New Cron Job**
2. Set:
   - **Command**: `curl -X POST https://your-timecapsule-api.onrender.com/api/notify/reminders -H "X-Notify-Secret: your_notify_secret_here"`
   - **Schedule**: `0 * * * *` (every hour)
3. Save

### Option B: External Cron Service (if Render doesn't support)
Use https://cron-job.org:
1. Create account
2. New cronjob
3. URL: `https://your-timecapsule-api.onrender.com/api/notify/reminders`
4. Method: POST
5. Headers: Add `X-Notify-Secret: your_notify_secret_here`
6. Schedule: Hourly

## Troubleshooting

**Email not sending?**
- Check `RESEND_API_KEY` is correct (starts with `re_`)
- Verify domain is confirmed in Resend dashboard
- Check backend logs for errors

**Reminders not sending?**
- Make sure `NOTIFY_SECRET` matches in env and cron header
- Check `/api/notify/reminders` endpoint responds to test call
- Verify capsules have `reminder_email_sent_at` column in Supabase

**Domain verification stuck?**
- Wait 5-30 minutes for DNS to propagate
- Check DNS records are exactly as Resend shows (copy-paste carefully)
- Use https://mxtoolbox.com to verify DNS records are live
