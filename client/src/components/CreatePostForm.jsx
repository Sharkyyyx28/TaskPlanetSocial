import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { createPost } from '../services/api';
import { Button, CircularProgress, IconButton } from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SendIcon from '@mui/icons-material/Send';
import CreateIcon from '@mui/icons-material/Create';
import CloseIcon from '@mui/icons-material/Close';

export default function CreatePostForm({ onPostCreated }) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imageFile) {
      setError('Please add some text or an image.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      if (text.trim()) formData.append('text', text.trim());
      if (imageFile) formData.append('image', imageFile);

      const res = await createPost(formData);
      setText('');
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onPostCreated(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-card">
      <div className="create-post-header">
        <CreateIcon fontSize="small" sx={{ color: '#1976d2' }} />
        Create Post
      </div>

      {error && (
        <div className="auth-error" style={{ marginBottom: 12 }}>{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <textarea
          className="create-post-textarea"
          placeholder={`What's on your mind, ${user?.username}?`}
          value={text}
          onChange={(e) => { setText(e.target.value); setError(''); }}
          rows={3}
        />

        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="Preview" />
            <button type="button" className="image-preview-remove" onClick={removeImage}>
              <CloseIcon sx={{ fontSize: 14 }} />
            </button>
          </div>
        )}

        <div className="create-post-actions">
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageChange}
              id="image-upload"
            />
            <IconButton
              component="label"
              htmlFor="image-upload"
              size="small"
              title="Add photo"
              sx={{
                color: '#1976d2',
                '&:hover': { background: '#e3f0ff' },
              }}
            >
              <PhotoCameraIcon fontSize="small" />
            </IconButton>
            <span style={{ fontSize: '12px', color: '#888' }}>
              {imageFile ? imageFile.name.substring(0, 20) + '...' : 'Add a photo'}
            </span>
          </div>

          <Button
            type="submit"
            variant="contained"
            size="small"
            disabled={loading || (!text.trim() && !imageFile)}
            endIcon={loading ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <SendIcon />}
            sx={{
              borderRadius: '20px',
              fontFamily: 'Inter',
              fontWeight: 600,
              textTransform: 'none',
              px: 3,
              background: 'linear-gradient(135deg, #1565c0, #1976d2)',
              '&:hover': { background: 'linear-gradient(135deg, #0d47a1, #1565c0)' },
              '&:disabled': { background: '#ccc', color: '#fff' },
            }}
          >
            {loading ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </form>
    </div>
  );
}
