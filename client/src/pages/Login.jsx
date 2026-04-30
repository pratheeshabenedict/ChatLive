import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { connect } = useSocket();

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      // ✅
      const { data } = await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/api/auth/${mode}`, form
      );
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      connect(data.token);
      navigate('/chat');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      fontFamily: "'DM Sans', system-ui, sans-serif",
      background: '#f7f6f3',
    }}>
      {/* Left panel - brand / marketing */}
      <div style={{
        display: 'none',
        flex: '0 0 60%',
        background: '#0f1117',
        padding: '48px 56px',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        '@media (min-width: 768px)': { display: 'flex' },
      }}
        className="brand-panel"
      >
        {/* Subtle grid pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative', zIndex: 1 }}>
          <div style={{
            width: 36, height: 36,
            background: '#e8e4d9',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="2" width="6" height="6" rx="1.5" fill="#0f1117" />
              <rect x="10" y="2" width="6" height="6" rx="1.5" fill="#0f1117" opacity="0.4" />
              <rect x="2" y="10" width="6" height="6" rx="1.5" fill="#0f1117" opacity="0.4" />
              <rect x="10" y="10" width="6" height="6" rx="1.5" fill="#0f1117" />
            </svg>
          </div>
          <span style={{ color: '#e8e4d9', fontWeight: 600, fontSize: 16, letterSpacing: '-0.3px' }}>
            Instant
          </span>
        </div>

        {/* Center copy */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{
            color: 'rgba(232,228,217,0.4)',
            fontSize: 12,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: 20,
          }}>
            Collaborative workspace
          </p>
          <h1 style={{
            color: '#e8e4d9',
            fontSize: 40,
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: '-1.5px',
            margin: '0 0 20px',
          }}>
            Where teams<br />move faster.
          </h1>
          <p style={{
            color: 'rgba(232,228,217,0.55)',
            fontSize: 15,
            lineHeight: 1.7,
            maxWidth: 360,
          }}>
            Real-time messaging, intelligent routing, and
            seamless integrations - all in one place.
          </p>
        </div>

        {/* Footer testimonial */}
        <div style={{
          position: 'relative', zIndex: 1,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: 24,
        }}>
          <p style={{ color: 'rgba(232,228,217,0.6)', fontSize: 14, lineHeight: 1.6, margin: '0 0 12px' }}>
            "Instant cut our response time in half. Our support team
            has never been more aligned."
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(232,228,217,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 600, color: '#e8e4d9',
            }}>SR</div>
            <div>
              <p style={{ margin: 0, color: '#e8e4d9', fontSize: 13, fontWeight: 500 }}>Pratheesha B</p>
              <p style={{ margin: 0, color: 'rgba(232,228,217,0.4)', fontSize: 12 }}>Made with MERN Stack</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div style={{

        flex: '0 0 100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
      }}
        className="form-panel"
      >
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Mobile logo */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            marginBottom: 40,
          }}
            className="mobile-logo"
          >
            <div style={{
              width: 36, height: 36, background: '#0f1117',
              borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="2" y="2" width="6" height="6" rx="1.5" fill="#e8e4d9" />
                <rect x="10" y="2" width="6" height="6" rx="1.5" fill="#e8e4d9" opacity="0.4" />
                <rect x="2" y="10" width="6" height="6" rx="1.5" fill="#e8e4d9" opacity="0.4" />
                <rect x="10" y="10" width="6" height="6" rx="1.5" fill="#e8e4d9" />
              </svg>
            </div>
            <span style={{ fontWeight: 600, fontSize: 16, color: '#0f1117', letterSpacing: '-0.3px' }}>
              Instant
            </span>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{
              margin: '0 0 6px',
              fontSize: 28,
              fontWeight: 700,
              color: '#0f1117',
              letterSpacing: '-0.8px',
            }}>
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p style={{ margin: 0, fontSize: 14, color: '#6b6b6b' }}>
              {mode === 'login'
                ? 'Sign in to continue to your workspace'
                : 'Start collaborating with your team today'}
            </p>
          </div>

          {/* Form fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{
                display: 'block', fontSize: 13, fontWeight: 500,
                color: '#3a3a3a', marginBottom: 6,
              }}>
                Username
              </label>
              <input
                placeholder="e.g. name"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                onKeyDown={handleKeyDown}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  height: 44, padding: '0 14px',
                  border: '1.5px solid #e2e0da',
                  borderRadius: 10,
                  fontSize: 14, color: '#0f1117',
                  background: '#fff',
                  outline: 'none',
                  transition: 'border-color 0.15s',
                  fontFamily: 'inherit',
                }}
                onFocus={e => e.target.style.borderColor = '#0f1117'}
                onBlur={e => e.target.style.borderColor = '#e2e0da'}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#3a3a3a' }}>
                  Password
                </label>
                {mode === 'login' && (
                  <button style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 12, color: '#6b6b6b', padding: 0,
                    fontFamily: 'inherit',
                    textDecoration: 'underline', textDecorationColor: 'transparent',
                    transition: 'color 0.15s',
                  }}
                    onMouseEnter={e => { e.target.style.color = '#0f1117'; }}
                    onMouseLeave={e => { e.target.style.color = '#6b6b6b'; }}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                onKeyDown={handleKeyDown}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  height: 44, padding: '0 14px',
                  border: '1.5px solid #e2e0da',
                  borderRadius: 10,
                  fontSize: 14, color: '#0f1117',
                  background: '#fff',
                  outline: 'none',
                  transition: 'border-color 0.15s',
                  fontFamily: 'inherit',
                }}
                onFocus={e => e.target.style.borderColor = '#0f1117'}
                onBlur={e => e.target.style.borderColor = '#e2e0da'}
              />
            </div>

            {/* Error message */}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 8,
                padding: '10px 14px',
                background: '#fef3f2',
                border: '1px solid #fecdca',
                borderRadius: 8,
              }}>
                <svg style={{ flexShrink: 0, marginTop: 1 }} width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <circle cx="7.5" cy="7.5" r="7" stroke="#e24b4a" strokeWidth="1.2" />
                  <path d="M7.5 4.5v3.5" stroke="#e24b4a" strokeWidth="1.4" strokeLinecap="round" />
                  <circle cx="7.5" cy="10.5" r="0.8" fill="#e24b4a" />
                </svg>
                <p style={{ margin: 0, fontSize: 13, color: '#b91c1c', lineHeight: 1.5 }}>{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading || !form.username || !form.password}
              style={{
                height: 46,
                background: loading || !form.username || !form.password ? '#c8c6c1' : '#0f1117',
                color: '#e8e4d9',
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: loading || !form.username || !form.password ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s, transform 0.1s',
                fontFamily: 'inherit',
                letterSpacing: '-0.2px',
                marginTop: 4,
              }}
              onMouseEnter={e => {
                if (!loading && form.username && form.password)
                  e.target.style.background = '#2a2a2a';
              }}
              onMouseLeave={e => {
                if (!loading && form.username && form.password)
                  e.target.style.background = '#0f1117';
              }}
              onMouseDown={e => { e.target.style.transform = 'scale(0.99)'; }}
              onMouseUp={e => { e.target.style.transform = 'scale(1)'; }}
            >
              {loading
                ? (mode === 'login' ? 'Signing in…' : 'Creating account…')
                : (mode === 'login' ? 'Sign in' : 'Create account')}
            </button>

            {/* Divider */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              margin: '4px 0',
            }}>
              <div style={{ flex: 1, height: '1px', background: '#e2e0da' }} />
              <span style={{ fontSize: 12, color: '#a8a49f' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: '#e2e0da' }} />
            </div>

            {/* Toggle mode */}
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 13, color: '#6b6b6b' }}>
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              </span>
              <button
                onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(''); }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600, color: '#0f1117',
                  padding: 0, fontFamily: 'inherit',
                }}
              >
                {mode === 'login' ? 'Register' : 'Sign in'}
              </button>
            </div>
          </div>

          {/* ToS note */}
          {/* {mode === 'register' && (
            <p style={{
              marginTop: 20, fontSize: 12,
              color: '#a8a49f', textAlign: 'center', lineHeight: 1.6,
            }}>
              By creating an account you agree to our{' '}
              <a href="#" style={{ color: '#6b6b6b', textDecoration: 'underline' }}>Terms of Service</a>
              {' '}and{' '}
              <a href="#" style={{ color: '#6b6b6b', textDecoration: 'underline' }}>Privacy Policy</a>
            </p>
          )} */}
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @media (min-width: 768px) {
          .brand-panel { display: flex !important; }
          .form-panel { flex: 0 0 460px !important; }
          .mobile-logo { display: none !important; }
        }
      `}</style>
    </div>
  );
}