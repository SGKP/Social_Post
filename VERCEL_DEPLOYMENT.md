# 🚀 Vercel Deployment Guide - Social Post App

## 📌 Environment Variables Needed

### **Backend Environment Variables** (Vercel/Railway/Render)
Add these in your hosting platform's environment variables section:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://shubhamgarg8073:hello@cluster1.uyicwn2.mongodb.net/socialpost?retryWrites=true&w=majority&appName=Cluster1
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_min_32_chars
CORS_ORIGIN=https://your-frontend-app.vercel.app
```

**⚠️ IMPORTANT:** Replace `your-frontend-app.vercel.app` with your actual Vercel frontend URL after deployment!

---

### **Frontend Environment Variables** (Vercel)
Add these in Vercel project settings:

```env
VITE_API_URL=https://your-backend-api.vercel.app/api
```

**⚠️ IMPORTANT:** Replace `your-backend-api.vercel.app` with your actual backend URL after deployment!

---

## 🔐 What is NODE_ENV?

### **NODE_ENV Explanation:**

`NODE_ENV` tells your application which **mode** it's running in:

- **`development`** → Local development
  - Detailed error messages
  - Hot reload enabled
  - Verbose logging
  - CORS allows localhost
  
- **`production`** → Live server
  - Optimized & compressed
  - Generic error messages (security)
  - Minimal logging
  - CORS restricted to your domain
  - Better performance

### **What Happens If You DON'T Use It?**

❌ **Without NODE_ENV:**
- App runs in development mode on production (SLOW!)
- Sensitive error details exposed to users (SECURITY RISK!)
- No optimization → Larger bundle sizes
- Can't separate dev/prod databases
- CORS might be too permissive (security issue)

✅ **With NODE_ENV=production:**
- Fast, optimized code
- Secure error handling
- Production database
- Proper CORS settings

---

## 📝 Step-by-Step Deployment

### **Step 1: Deploy Backend First**

1. **Option A: Deploy to Render.com** (Recommended for Node.js backend)
   - Go to [render.com](https://render.com)
   - Connect GitHub repo
   - Select `backend` folder
   - Set environment variables (see above)
   - Deploy!

2. **Option B: Deploy to Railway.app**
   - Go to [railway.app](https://railway.app)
   - Connect GitHub repo
   - Add environment variables
   - Deploy!

3. **Get your backend URL** → e.g., `https://social-post-api.onrender.com`

---

### **Step 2: Deploy Frontend to Vercel**

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. **Configure Build Settings:**
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   
4. **Add Environment Variables:**
   - Key: `VITE_API_URL`
   - Value: `https://your-backend-url/api`
   
5. Click **Deploy**!

6. Get your frontend URL → e.g., `https://social-post-app.vercel.app`

---

### **Step 3: Update Backend CORS**

After getting your Vercel frontend URL:

1. Go back to your backend hosting (Render/Railway)
2. Update environment variable:
   ```
   CORS_ORIGIN=https://social-post-app.vercel.app
   ```
3. Redeploy backend

---

## ✅ Verification Checklist

- [ ] Backend deployed and running
- [ ] Frontend deployed and running
- [ ] MongoDB connection working
- [ ] `NODE_ENV=production` set on backend
- [ ] `VITE_API_URL` pointing to backend URL
- [ ] `CORS_ORIGIN` set to frontend URL
- [ ] Can create account
- [ ] Can login
- [ ] Can create posts
- [ ] Can like/comment/save posts
- [ ] Profile pictures uploading
- [ ] Search working

---

## 🐛 Common Issues

### **CORS Error**
```
Access to fetch has been blocked by CORS policy
```
**Solution:** Make sure `CORS_ORIGIN` in backend matches your frontend URL exactly (with https://, no trailing slash)

### **API Not Found (404)**
**Solution:** Check `VITE_API_URL` has `/api` at the end

### **JWT/Auth Not Working**
**Solution:** Make sure `JWT_SECRET` is the same value you used in development

### **Database Connection Failed**
**Solution:** Check MongoDB URI is correct and MongoDB Atlas allows connections from anywhere (0.0.0.0/0) in Network Access

---

## 📱 Production URLs (Update After Deployment)

- **Frontend:** `https://your-app.vercel.app`
- **Backend:** `https://your-api.onrender.com`
- **Database:** MongoDB Atlas (already set up)

---

## 🔒 Security Best Practices

1. **Change JWT_SECRET** to a strong random string (32+ characters)
2. **Never commit .env files** to GitHub
3. **Use different databases** for dev and production
4. **Enable MongoDB IP Whitelist** in production
5. **Set strong MongoDB password**
6. **Keep dependencies updated**

---

## 📞 Support

If deployment fails, check:
1. Backend logs in Render/Railway dashboard
2. Vercel deployment logs
3. Browser console for frontend errors
4. MongoDB Atlas logs

Good luck! 🚀
