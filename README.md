# Mini Social Post Application

A full-stack social media application inspired by TaskPlanet's Social Page, built with React + Vite, Node.js, Express, and MongoDB.

## 🎯 Features

✅ **User Authentication**
- Signup and Login with email & password
- JWT-based authentication
- Protected routes

✅ **Post Management**
- Create posts with text, image, or both
- View all posts in a public feed
- Delete your own posts

✅ **Social Interactions**
- Like and unlike posts
- Comment on posts
- Real-time updates of likes and comments count
- Display usernames of people who interacted

✅ **UI/UX**
- TaskPlanet-inspired design (Blue & Orange theme)
- Clean and modern Material-UI components
- Responsive design for all devices
- Smooth animations and transitions

## 🛠️ Tech Stack

**Frontend:**
- React 18 with Vite
- Material-UI (MUI)
- React Router v6
- Axios for API calls
- Context API for state management

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

## 📁 Project Structure

```
Social_post/
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── api/           # API integration
│   │   ├── components/    # React components
│   │   ├── context/       # Context providers
│   │   ├── pages/         # Page components
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── backend/               # Express.js backend
    ├── models/            # MongoDB models
    ├── routes/            # API routes
    ├── middleware/        # Auth middleware
    ├── server.js
    └── package.json
```

## 🚀 Local Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- Git

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in the backend folder:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
```

4. Start the backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in the frontend folder:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## 🌐 Deployment Guide

### MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist IP: `0.0.0.0/0` (for development)
5. Get your connection string
6. Replace `<password>` and `<dbname>` in the connection string

### Backend Deployment (Render)

1. Push your code to GitHub
2. Go to [Render](https://render.com/)
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: social-post-backend
   - **Root Directory**: backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Add environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`
7. Click "Create Web Service"
8. Copy the deployment URL (e.g., `https://social-post-backend.onrender.com`)

### Frontend Deployment (Vercel)

1. Go to [Vercel](https://vercel.com/)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: frontend
   - **Build Command**: `npm run build`
   - **Output Directory**: dist
5. Add environment variable:
   - `VITE_API_URL=https://your-backend-url.onrender.com/api`
6. Click "Deploy"
7. Your app will be live at `https://your-app.vercel.app`

### Alternative: Frontend on Netlify

1. Go to [Netlify](https://www.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub
4. Configure:
   - **Base directory**: frontend
   - **Build command**: `npm run build`
   - **Publish directory**: frontend/dist
5. Add environment variable:
   - `VITE_API_URL=https://your-backend-url.onrender.com/api`
6. Click "Deploy"

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Posts
- `GET /api/posts` - Get all posts (with pagination)
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create new post (protected)
- `POST /api/posts/:id/like` - Like/Unlike post (protected)
- `POST /api/posts/:id/comment` - Add comment (protected)
- `DELETE /api/posts/:id` - Delete post (protected)

### Users
- `GET /api/users/me/profile` - Get current user (protected)
- `GET /api/users/:id` - Get user by ID

## 🎨 Design Inspiration

The UI is inspired by TaskPlanet app:
- **Primary Color**: Blue (#2962FF)
- **Secondary Color**: Orange (#FF5722)
- **Card-based layout**
- **Modern gradient backgrounds**
- **Clean typography with Roboto font**

## 📦 Database Collections

### Users Collection
```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  profilePicture: String,
  bio: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Posts Collection
```javascript
{
  user: ObjectId (ref: User),
  username: String,
  text: String,
  image: String (base64),
  likes: [ObjectId],
  likesCount: Number,
  comments: [{
    user: ObjectId,
    username: String,
    text: String,
    createdAt: Date
  }],
  commentsCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## 🎯 Assignment Completion Checklist

- ✅ User signup and login with email/password
- ✅ Store user details in MongoDB
- ✅ Create posts with text, image, or both
- ✅ Public feed showing all posts
- ✅ Display username, likes, and comments count
- ✅ Like and comment functionality
- ✅ Save usernames of likers and commenters
- ✅ TaskPlanet-inspired UI
- ✅ Material-UI styling (no TailwindCSS)
- ✅ Two MongoDB collections (users & posts)
- ✅ Clean, reusable code with comments
- ✅ Responsive design
- ✅ Ready for deployment

## 🏆 Bonus Features Implemented

- ✅ Clean and modern UI matching TaskPlanet design
- ✅ Fully responsive layout
- ✅ Pagination support for posts
- ✅ Real-time UI updates
- ✅ Well-structured and commented code
- ✅ Error handling and validation
- ✅ Protected routes and authentication
- ✅ Delete post functionality

## 👨‍💻 Developer

**3W Full Stack Internship Assignment**
- Submission Deadline: 03 Nov 2025

## 📄 License

This project is created for internship assignment purposes.

---

**Built with ❤️ for 3W Internship Assignment**
