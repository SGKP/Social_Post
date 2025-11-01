# Quick Setup Guide

## 🚀 Getting Started in 3 Steps

### Step 1: Install Dependencies

#### Backend
```powershell
cd backend
npm install
```

#### Frontend
```powershell
cd frontend
npm install
```

### Step 2: Configure Environment Variables

#### Backend (.env)
Create `backend/.env` file:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/socialpost?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key_change_this_in_production
```

#### Frontend (.env)
Create `frontend/.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

### Step 3: Run the Application

#### Terminal 1 - Backend
```powershell
cd backend
npm run dev
```
Server runs on: http://localhost:5000

#### Terminal 2 - Frontend
```powershell
cd frontend
npm run dev
```
App runs on: http://localhost:3000

## 🎯 Quick Test

1. Open http://localhost:3000
2. Click "Sign up here"
3. Create an account
4. Create your first post
5. Like and comment on posts

## 📝 MongoDB Atlas Quick Setup

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free
3. Create a FREE cluster (M0)
4. Database Access → Add New User
   - Username: `socialpostuser`
   - Password: (generate or create one)
5. Network Access → Add IP Address
   - Add `0.0.0.0/0` (allow from anywhere)
6. Clusters → Connect → Connect your application
7. Copy connection string
8. Replace in backend/.env MONGODB_URI

## ⚙️ Install MongoDB Atlas

If you need local MongoDB (optional):
```powershell
# Using chocolatey
choco install mongodb

# Or download from mongodb.com
```

## 🔧 Troubleshooting

### Port Already in Use
```powershell
# Change PORT in backend/.env to 5001 or any other port
# Update VITE_API_URL in frontend/.env accordingly
```

### MongoDB Connection Error
- Check your MongoDB Atlas IP whitelist
- Verify connection string format
- Ensure username/password are correct

### Frontend Can't Connect to Backend
- Ensure backend is running
- Check VITE_API_URL in frontend/.env
- Verify no CORS issues in browser console

## 📦 Production Build

### Frontend
```powershell
cd frontend
npm run build
```
Build output in `frontend/dist/`

### Backend
Already production ready - just set NODE_ENV=production

---

**Need help? Check README.md for detailed documentation**
