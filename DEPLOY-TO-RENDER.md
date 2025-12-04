# Deploy to Render.com - Complete Guide

**Total time:** ~30 minutes
**Cost:** $0 (free tier)
**Result:** Professional URL like `https://multilingual-chat.onrender.com`

---

## 🎯 What You'll Deploy

- ✅ Frontend (Static Site) - Free
- ✅ Backend API (Web Service) - Free
- ✅ PostgreSQL Database - Free
- ✅ Auto HTTPS - Free
- ✅ No tunneling needed!

---

## 📋 Prerequisites

1. **GitHub account** (free) - To push your code
2. **Render account** (free) - Sign up at render.com
3. **Your code** - Already have it!

---

## 🚀 Step-by-Step Deployment

### Phase 1: Prepare Your Code (5 minutes)

**Step 1: Commit everything**
```bash
git add -A
git commit -m "Prepare for Render deployment"
```

**Step 2: Push to GitHub**
```bash
# If you haven't already, create a GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

---

### Phase 2: Create Render Account (2 minutes)

1. Go to **https://render.com**
2. Click "Get Started"
3. Sign up with GitHub (easiest)
4. Authorize Render to access your repos

---

### Phase 3: Deploy Backend (10 minutes)

**Step 1: Create Web Service**

1. In Render dashboard, click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select your repo
4. Configure:
   - **Name:** `multilingual-chat-backend`
   - **Region:** Choose closest to you
   - **Branch:** `main` (or your current branch)
   - **Root Directory:** `backend/services/chat-service`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free

**Step 2: Add Environment Variables**

Click "Advanced" → "Add Environment Variable":

```
NODE_ENV=production
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-in-production-123
CORS_ORIGIN=*
DATABASE_URL=postgresql://... (will be auto-filled when you add database)
```

**Step 3: Create PostgreSQL Database**

1. In Render dashboard, click "New +" → "PostgreSQL"
2. Configure:
   - **Name:** `multilingual-chat-db`
   - **Database:** `multilingual_chat`
   - **User:** `multilingual_user`
   - **Region:** Same as your backend
   - **Plan:** Free
3. Click "Create Database"
4. Wait for it to provision (~2 minutes)

**Step 4: Link Database to Backend**

1. Go to your backend web service
2. Environment → Add:
   - **Key:** `DATABASE_URL`
   - **Value:** Copy from PostgreSQL database dashboard (Internal Database URL)

**Step 5: Deploy!**

Click "Create Web Service" - Render will:
1. Clone your repo
2. Install dependencies
3. Build your app
4. Start your service

Wait 5-10 minutes for first deploy.

---

### Phase 4: Deploy Frontend (8 minutes)

**Step 1: Create Static Site**

1. In Render dashboard, click "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name:** `multilingual-chat-frontend`
   - **Branch:** `main`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`

**Step 2: Add Environment Variables**

```
VITE_API_URL=https://multilingual-chat-backend.onrender.com/api
VITE_WS_URL=https://multilingual-chat-backend.onrender.com
```

**Step 3: Deploy!**

Click "Create Static Site" - takes ~5 minutes.

---

### Phase 5: Configure Services (5 minutes)

**Update CORS in Backend**

The `.env` file already has `CORS_ORIGIN=*`, so your backend accepts requests from anywhere.

**Test Your Deployment**

1. Go to your frontend URL: `https://multilingual-chat-frontend.onrender.com`
2. Create an account
3. Create a meeting
4. Test features!

---

## 🎉 You're Live!

**Your URLs:**
- Frontend: `https://multilingual-chat-frontend.onrender.com`
- Backend: `https://multilingual-chat-backend.onrender.com`
- Database: Managed by Render

**Share with client:**
```
Hey! Check out the demo:
https://multilingual-chat-frontend.onrender.com

Create an account and join a meeting!
```

---

## 🐛 Troubleshooting

### Issue: Backend won't start

**Check logs:**
1. Go to your backend service
2. Click "Logs"
3. Look for errors

**Common fixes:**
- Database connection string wrong
- Missing environment variables
- Build failed (check Build Logs)

### Issue: Frontend shows errors

**Check:**
1. Is `VITE_API_URL` correct?
2. Did you include `https://` in the URL?
3. Check browser console for CORS errors

### Issue: "This site can't be reached"

**Cause:** Service is sleeping (free tier sleeps after 15 min)

**Fix:** Wait 30 seconds - it wakes automatically on first request

### Issue: Database connection failed

**Fix:**
1. Make sure PostgreSQL database is created
2. Copy the correct connection string
3. Use "Internal Database URL" (not External)

---

## ⚡ Performance Tips

### Keep Service Awake

**Free option:** Use a service like UptimeRobot to ping your app every 5 minutes
- Sign up at uptimerobot.com (free)
- Add monitor for your Render URL
- Pings every 5 min = stays awake

**Paid option:** Upgrade to paid plan ($7/month)
- No sleeping
- More resources
- Better performance

### Speed Optimization

1. **Use CDN:** Render has built-in CDN for static sites
2. **Minimize bundle:** Already using Vite (optimized)
3. **Database indices:** Add to frequently queried columns

---

## 💰 Costs

**Free Tier (What you get):**
- 1 Web Service (backend) - Sleeps after 15 min
- 1 Static Site (frontend) - No sleeping
- 1 PostgreSQL database (1GB) - No sleeping
- 750 hours/month free
- 100GB bandwidth

**If you need more:**
- Always-on backend: $7/month
- More RAM/CPU: $7-25/month per service
- Larger database: $7/month for 10GB

---

## 🔄 Continuous Deployment

**Automatic:**
Every time you push to GitHub, Render auto-deploys!

```bash
# Make changes
git add .
git commit -m "Add new feature"
git push

# Render automatically deploys (takes ~5 min)
```

---

## 📊 What About Other Services?

Your app has 4 services:
1. Chat Service (main) ← Deploy this
2. Translation Service
3. STT Service
4. TTS Service

**Strategy for FREE deployment:**

**Option A:** Combine all into chat service
- Merge translation/STT/TTS into main backend
- Deploy as one service
- Free!

**Option B:** Deploy separately
- Chat service: Free tier
- Other services: $7/month each
- Total: $21/month

**Recommendation:** Start with Option A (free), split later if needed.

---

## 🎯 Next Steps

1. **Test thoroughly** - Make sure everything works
2. **Add monitoring** - Use Render's built-in metrics
3. **Set up UptimeRobot** - Keep service awake
4. **Get feedback** - Share with client!
5. **Optimize** - Improve based on usage

---

## 📝 Alternative: One-Click Deploy

I can create a `render.yaml` file that deploys everything with one click!

Want me to create that?

---

## ✅ Success Checklist

Before sharing with client:
- [ ] Backend deployed and running
- [ ] Frontend deployed and accessible
- [ ] Database connected
- [ ] Can create account
- [ ] Can create meeting
- [ ] Transcription works
- [ ] Translation works
- [ ] TTS works
- [ ] UptimeRobot monitoring set up

---

**Ready to deploy? Let's do it!** 🚀

Need help with any step? Just ask!
