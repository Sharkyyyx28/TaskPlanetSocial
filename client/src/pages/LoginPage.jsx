import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi } from '../services/api';
import { Button, TextField, CircularProgress } from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await loginApi(form);
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <PublicIcon fontSize="small" />
          </div>
          <span className="auth-logo-text">TaskPlanet Social</span>
        </div>
        <h1 className="auth-title">Welcome back 👋</h1>
        <p className="auth-subtitle">Log in to see what's happening</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            size="small"
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '10px', fontFamily: 'Inter' } }}
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            size="small"
            sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '10px', fontFamily: 'Inter' } }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              py: 1.4,
              borderRadius: '12px',
              fontFamily: 'Inter',
              fontWeight: 700,
              fontSize: '15px',
              background: 'linear-gradient(135deg, #1565c0, #1976d2)',
              boxShadow: '0 4px 16px rgba(21, 101, 192, 0.35)',
              textTransform: 'none',
              '&:hover': { background: 'linear-gradient(135deg, #0d47a1, #1565c0)' },
            }}
          >
            {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Log In'}
          </Button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#555' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: '#1976d2', fontWeight: 600, textDecoration: 'none' }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
