# Render Deployment - Follow These Steps

✅ **Code is pushed to GitHub!**
- Repository: https://github.com/Koshai/MultiLingualChat
- Branch: `feature/tunneling-alternatives`

---

## 📋 Step-by-Step Deployment (20 minutes)

### **PHASE 1: Create Render Account (3 minutes)**

**Step 1:** Go to https://render.com

**Step 2:** Click "Get Started for Free"

**Step 3:** Click "GitHub" to sign up with GitHub
- ✅ This is the easiest way
- ✅ Automatically connects your repositories

**Step 4:** Authorize Render
- Click "Authorize Render"
- Enter your GitHub password if prompted

✅ **You now have a Render account!**

---

### **PHASE 2: Deploy Backend (10 minutes)**

**Step 1:** In Render dashboard, click "New +" → "Web Service"

**Step 2:** Connect Repository
- Find "Koshai/MultiLingualChat" in the list
- Click "Connect"

**Step 3:** Configure Web Service

Fill in these details:

| Field | Value |
|-------|-------|
| **Name** | `multilingual-chat-backend` |
| **Region** | `Oregon (US West)` or closest to you |
| **Branch** | `feature/tunneling-alternatives` |
| **Root Directory** | `backend/services/chat-service` |
| **Environment** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Plan** | `Free` |

**Step 4:** Add Environment Variables

Click "Advanced" → "Add Environment Variable"

Add these (click "+ Add" for each):

```
NODE_ENV = production
PORT = 3001
JWT_SECRET = your-super-secret-jwt-key-change-in-production-abc123xyz
CORS_ORIGIN = *
```

**Step 5:** Click "Create Web Service"

⏳ Wait 5-10 minutes for deployment...

Watch the logs - you'll see:
- Installing dependencies...
- Building...
- Starting...
- 🚀 Live!

✅ **Backend is deploying!**

**Copy the URL** - it will look like:
```
https://multilingual-chat-backend.onrender.com
```

---

### **PHASE 3: Create Database (5 minutes)**

**Step 1:** In Render dashboard, click "New +" → "PostgreSQL"

**Step 2:** Configure Database

| Field | Value |
|-------|-------|
| **Name** | `multilingual-chat-db` |
| **Database** | `multilingual_chat` |
| **User** | `multilingual_user` |
| **Region** | Same as backend (Oregon) |
| **Plan** | `Free` |

**Step 3:** Click "Create Database"

⏳ Wait 2-3 minutes for provisioning...

✅ **Database is created!**

**Step 4:** Connect Database to Backend

1. Click on your database
2. Copy the **Internal Database URL** (starts with `postgresql://`)
3. Go back to your backend web service
4. Click "Environment" tab
5. Click "Add Environment Variable"
6. Add:
   - **Key:** `DATABASE_URL`
   - **Value:** Paste the database URL
7. Click "Save Changes"

⚙️ **Backend will redeploy automatically** (takes 2-3 minutes)

---

### **PHASE 4: Deploy Frontend (7 minutes)**

**Step 1:** In Render dashboard, click "New +" → "Static Site"

**Step 2:** Connect Repository
- Find "Koshai/MultiLingualChat"
- Click "Connect"

**Step 3:** Configure Static Site

| Field | Value |
|-------|-------|
| **Name** | `multilingual-chat-frontend` |
| **Branch** | `feature/tunneling-alternatives` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

**Step 4:** Add Environment Variables

Click "Advanced" → "Add Environment Variable"

**IMPORTANT:** Replace `multilingual-chat-backend` with YOUR actual backend URL!

```
VITE_API_URL = https://multilingual-chat-backend.onrender.com/api
VITE_WS_URL = https://multilingual-chat-backend.onrender.com
VITE_TRANSLATION_API_URL = https://multilingual-chat-backend.onrender.com/translation-api
```

**Step 5:** Click "Create Static Site"

⏳ Wait 5-7 minutes for build and deployment...

✅ **Frontend is deploying!**

**Copy the URL** - it will look like:
```
https://multilingual-chat-frontend.onrender.com
```

---

## 🎉 YOU'RE LIVE!

### **Your URLs:**
- **Frontend (share this):** `https://multilingual-chat-frontend.onrender.com`
- **Backend API:** `https://multilingual-chat-backend.onrender.com`
- **Database:** Managed by Render (you don't access directly)

### **Test It:**

1. Open your frontend URL in browser
2. Create an account
3. Create a meeting
4. Invite someone!

---

## ⚠️ Important Notes

### **Free Tier Behavior:**
- Services "sleep" after 15 minutes of no activity
- First visit after sleeping takes ~30 seconds to wake up
- This is normal for free tier!
- **Solution:** Use UptimeRobot.com (free) to ping every 5 minutes

### **If Something Doesn't Work:**

**Check Logs:**
1. Go to your service in Render
2. Click "Logs" tab
3. Look for error messages

**Common Issues:**
- **Database not connected:** Make sure you added DATABASE_URL to backend
- **CORS errors:** Make sure CORS_ORIGIN=* in backend env vars
- **Build failed:** Check the build logs for npm install errors
- **Frontend can't reach backend:** Make sure VITE_API_URL is correct

---

## 🚀 Next Steps After Deployment

### **1. Set Up Keep-Alive (Optional)**
Prevent free tier sleeping:

1. Go to https://uptimerobot.com
2. Sign up (free)
3. Add New Monitor:
   - **Type:** HTTP(s)
   - **URL:** Your frontend URL
   - **Interval:** 5 minutes
4. Save

Now your app stays awake!

### **2. Share With Client**

Send this message:
```
Hey! Check out the live demo:
https://multilingual-chat-frontend.onrender.com

Create an account and join a meeting to see real-time translation!

Note: First load might take 30 seconds (free tier wakes from sleep).
After that, it's instant!
```

### **3. Monitor Performance**

In Render dashboard:
- Check "Metrics" tab
- See requests, CPU, memory usage
- Watch for errors in logs

---

## ✅ Deployment Checklist

- [ ] Render account created
- [ ] Backend web service deployed
- [ ] PostgreSQL database created
- [ ] Database connected to backend
- [ ] Frontend static site deployed
- [ ] Frontend can reach backend
- [ ] Can create account
- [ ] Can create meeting
- [ ] UptimeRobot monitoring set up (optional)
- [ ] Client demo tested

---

## 🆘 Need Help?

**If stuck, check:**
1. Render logs for errors
2. Browser console (F12) for frontend errors
3. Make sure all environment variables are set correctly

**Common fixes:**
- Redeploy: Click "Manual Deploy" → "Deploy latest commit"
- Check environment variables: Make sure URLs are correct
- Wait longer: First deploy can take 10-15 minutes

---

**Ready to deploy? Go to https://render.com and follow the steps above!** 🚀
