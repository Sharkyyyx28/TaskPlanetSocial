import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { likePost, commentPost } from '../services/api';
import { IconButton, Button, CircularProgress } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShareIcon from '@mui/icons-material/Share';

const API_BASE = import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') : 'http://localhost:5000';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function getInitials(username) {
  return username ? username.slice(0, 2).toUpperCase() : '??';
}

export default function PostCard({ post, onUpdate }) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const [likingPost, setLikingPost] = useState(false);

  const liked = post.likes?.some((id) => id === user?.id || id?._id === user?.id || id?.toString() === user?.id);
  const likesCount = post.likesCount ?? post.likes?.length ?? 0;
  const commentsCount = post.commentsCount ?? post.comments?.length ?? 0;

  const handleLike = async () => {
    if (likingPost) return;
    setLikingPost(true);
    try {
      const res = await likePost(post._id);
      onUpdate(post._id, {
        likes: res.data.likes,
        likesCount: res.data.likesCount,
      });
    } catch (err) {
      console.error('Like error', err);
    } finally {
      setLikingPost(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || postingComment) return;
    setPostingComment(true);
    try {
      const res = await commentPost(post._id, commentText.trim());
      onUpdate(post._id, {
        comments: [...(post.comments || []), res.data.comment],
        commentsCount: res.data.commentsCount,
      });
      setCommentText('');
    } catch (err) {
      console.error('Comment error', err);
    } finally {
      setPostingComment(false);
    }
  };

  const authorName = post.authorData?.username || post.author?.username || 'Unknown';
  const handle = '@' + authorName.toLowerCase().replace(/\s/g, '');

  return (
    <div className="post-card">
 
      <div className="post-header">
        <div className="post-author">
          <div className="post-avatar">{getInitials(authorName)}</div>
          <div className="post-author-info">
            <div className="post-username">{authorName}</div>
            <div className="post-handle">{handle}</div>
          </div>
        </div>
        <div className="post-date">{formatDate(post.createdAt)}</div>
      </div>

      {post.text && <div className="post-text">{post.text}</div>}
      {post.imageUrl && (
        <img
          src={`${API_BASE}${post.imageUrl}`}
          alt="Post"
          className="post-image"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      )}

      <div className="post-actions">
        <button
          className={`action-btn ${liked ? 'liked' : ''}`}
          onClick={handleLike}
          disabled={likingPost}
        >
          {liked
            ? <FavoriteIcon sx={{ fontSize: 18 }} />
            : <FavoriteBorderIcon sx={{ fontSize: 18 }} />}
          <span>{likesCount}</span>
        </button>

        <button
          className="action-btn"
          onClick={() => setShowComments((v) => !v)}
        >
          <ChatBubbleOutlineIcon sx={{ fontSize: 18 }} />
          <span>{commentsCount}</span>
        </button>

        <button className="action-btn" style={{ marginLeft: 'auto' }}>
          <ShareIcon sx={{ fontSize: 18 }} />
          <span>0</span>
        </button>
      </div>


      {showComments && (
        <div className="comments-section">
 
          {post.comments && post.comments.length > 0 ? (
            post.comments.map((c, i) => (
              <div key={c._id || i} className="comment-item">
                <div className="comment-avatar">{getInitials(c.username)}</div>
                <div className="comment-bubble">
                  <div className="comment-username">{c.username}</div>
                  <div className="comment-text">{c.text}</div>
                </div>
              </div>
            ))
          ) : (
            <p style={{ fontSize: '13px', color: '#999', marginBottom: '10px' }}>
              No comments yet. Be the first! 💬
            </p>
          )}


          <form className="comment-input-row" onSubmit={handleComment}>
            <div className="comment-avatar">{getInitials(user?.username)}</div>
            <input
              className="comment-input"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <IconButton
              type="submit"
              disabled={!commentText.trim() || postingComment}
              size="small"
              sx={{
                background: '#1976d2',
                color: '#fff',
                width: 34,
                height: 34,
                flexShrink: 0,
                '&:hover': { background: '#1565c0' },
                '&:disabled': { background: '#ccc' },
              }}
            >
              {postingComment
                ? <CircularProgress size={14} sx={{ color: '#fff' }} />
                : <span style={{ fontSize: 16, lineHeight: 1 }}>↑</span>}
            </IconButton>
          </form>
        </div>
      )}
    </div>
  );
}
