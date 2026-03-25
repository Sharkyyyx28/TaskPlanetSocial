import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPosts } from '../services/api';
import CreatePostForm from '../components/CreatePostForm';
import PostCard from '../components/PostCard';
import { IconButton, CircularProgress, Avatar } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import PublicIcon from '@mui/icons-material/Public';
import RefreshIcon from '@mui/icons-material/Refresh';

const TABS = [
  { label: 'All Posts', value: '' },
  { label: 'Most Liked', value: 'likes' },
  { label: 'Most Commented', value: 'comments' },
];

function getInitials(username) {
  return username ? username.slice(0, 2).toUpperCase() : '??';
}

export default function FeedPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const [error, setError] = useState('');

  const fetchPosts = useCallback(async (sort = '') => {
    setLoading(true);
    setError('');
    try {
      const res = await getPosts(sort);
      setPosts(res.data);
    } catch (err) {
      setError('Failed to load posts. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(activeTab);
  }, [activeTab, fetchPosts]);

  const handleTabChange = (val) => {
    setActiveTab(val);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };


  const handlePostCreated = (newPost) => {
    const enriched = {
      ...newPost,
      authorData: { username: user.username, _id: user.id },
      likes: [],
      likesCount: 0,
      comments: [],
      commentsCount: 0,
    };
    setPosts((prev) => [enriched, ...prev]);
  };

  const handlePostUpdate = (postId, updates) => {
    setPosts((prev) =>
      prev.map((p) =>
        (p._id === postId) ? { ...p, ...updates } : p
      )
    );
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-brand">
            <PublicIcon fontSize="small" />
            TaskPlanet Social
          </div>
          <div className="navbar-user">
            <span className="nav-username">@{user?.username}</span>
            <Avatar
              sx={{
                width: 32, height: 32, fontSize: 13,
                background: 'linear-gradient(135deg, #fff3, #ffffff55)',
                color: '#fff', fontWeight: 700, fontFamily: 'Inter',
              }}
            >
              {getInitials(user?.username)}
            </Avatar>
            <IconButton
              onClick={handleLogout}
              size="small"
              title="Log out"
              sx={{ color: 'rgba(255,255,255,0.85)', '&:hover': { color: '#fff' } }}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </div>
        </div>
      </nav>


      <div className="feed-layout" style={{ paddingTop: 16 }}>

        <CreatePostForm onPostCreated={handlePostCreated} />

 
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="filter-tabs" style={{ flex: 1 }}>
            {TABS.map((tab) => (
              <button
                key={tab.value}
                className={`filter-tab ${activeTab === tab.value ? 'active' : ''}`}
                onClick={() => handleTabChange(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <IconButton
            onClick={() => fetchPosts(activeTab)}
            size="small"
            title="Refresh"
            sx={{ color: '#1976d2', '&:hover': { background: '#e3f0ff' } }}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </div>


        {loading ? (
          <div style={{ textAlign: 'center', paddingTop: 40 }}>
            <CircularProgress sx={{ color: '#1976d2' }} />
            <p style={{ marginTop: 12, color: '#888', fontSize: 14 }}>Loading posts...</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <div className="empty-state-icon">⚠️</div>
            <div className="empty-state-text">Something went wrong</div>
            <div className="empty-state-sub">{error}</div>
          </div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <div className="empty-state-text">No posts yet</div>
            <div className="empty-state-sub">Be the first to share something!</div>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onUpdate={handlePostUpdate}
            />
          ))
        )}
      </div>
    </>
  );
}
