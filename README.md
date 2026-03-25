# TaskPlanet Mini Social Post Application 🌍

A full-stack, responsive social media platform inspired by the Social Page of the TaskPlanet app. Users can create accounts, post text or images, scroll a public feed, and seamlessly like or comment on posts with optimistic UI updates.

---

## 🌟 Key Features

- **Authentication System**: Secure signup and login flow using JWT (JSON Web Tokens) and bcrypt password hashing.
- **Social Feed**: A public feed displaying all user posts, enriched with usernames, avatars, and timestamps.
- **Rich Posts**: Support for text-only posts, image-only posts, or both. Images are uploaded via `multer` and served statically.
- **Real-Time Interactions**: Optimistic UI updates for likes and comments, making the application feel instantaneous and responsive.
- **Sorting Options**: Filter the feed by "All Posts", "Most Liked", or "Most Commented".

---

## 🛠️ Technology Stack

### Frontend (Client)
- **Framework**: React.js with Vite
- **Styling**: Material UI (MUI) components + Custom Vanilla CSS (TaskPlanet aesthetic)
- **Routing**: React Router v6
- **Data Fetching**: Axios

### Backend (Server)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose ORM)
- **Authentication**: JWT (JSON Web Tokens)
- **File Uploads**: Multer

---

## 🚀 Local Setup & Installation

### Prerequisites
- Node.js installed on your machine
- MongoDB Atlas account (or local MongoDB server)

### 1. Clone the repository
```bash
git clone https://github.com/Sharkyyyx28/TaskPlanetSocial.git
cd TaskPlanetClone
```

### 2. Backend Setup
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` folder and add the following:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Open a new terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

---

## 📁 Directory Structure

```text
TaskPlanetClone/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components (PostCard, CreatePostForm)
│   │   ├── context/        # React Context (AuthContext)
│   │   ├── pages/          # Full page views (Feed, Login, Signup)
│   │   ├── services/       # Axios API integration
│   │   ├── App.jsx         # Main router and route protection
│   │   └── index.css       # Global styling
│   └── package.json        
└── server/                 # Node.js Backend
    ├── middleware/         # Custom Express middlewares (Auth verification)
    ├── models/             # Mongoose schemas (User, Post)
    ├── routes/             # API routes (auth, posts)
    ├── uploads/            # Statically served user-uploaded images
    ├── server.js           # Express app entry point
    └── package.json
```
