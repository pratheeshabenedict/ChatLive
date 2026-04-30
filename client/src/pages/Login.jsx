import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';

export default function Login() {
  const [form, setForm]   = useState({ username: '', password: '' });
  const [mode, setMode]   = useState('login');   // 'login' | 'register'
  const [error, setError] = useState('');
  const navigate          = useNavigate();
  const { connect }       = useSocket();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await axios.post(
        `http://localhost:5000/api/auth/${mode}`, form
      );
      localStorage.setItem('token',    data.token);
      localStorage.setItem('username', data.username);
      connect(data.token);          // open WebSocket right after login
      navigate('/chat');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div style={{ maxWidth: 360, margin: '80px auto', padding: '0 16px' }}>
      <h2 style={{ marginBottom: 24 }}>
        {mode === 'login' ? 'Sign in' : 'Create account'}
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          placeholder="Username"
          value={form.username}
          onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
        />
        {error && <p style={{ color: 'var(--color-text-danger)', fontSize: 13 }}>{error}</p>}
        <button onClick={handleSubmit}>
          {mode === 'login' ? 'Login' : 'Register'}
        </button>
        <button
          onClick={() => setMode(m => m === 'login' ? 'register' : 'login')}
          style={{ background: 'none', border: 'none', cursor: 'pointer',
                   color: 'var(--color-text-secondary)', fontSize: 13 }}
        >
          {mode === 'login' ? 'No account? Register' : 'Have an account? Login'}
        </button>
      </div>
    </div>
  );
}