import { useState } from 'react';

const Login = ({ onLogin, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('https://redis-jobseeker.onrender.comapi/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');

      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '1rem' }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '1rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        padding: '2rem',
        width: '100%',
        maxWidth: '380px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <img src="/yuvii-logo.jpeg" alt="Yuvii Logo" style={{ width: '80px', borderRadius: '0.75rem' }} />
        </div>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#0f172a', fontSize: '1.25rem', fontWeight: '600' }}>Welcome Back</h2>

        {error && <div style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '0.625rem 0.875rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.8rem' }}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="username">Email Address</label>
            <input
              type="email"
              id="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" className="search-btn" disabled={isLoading} style={{ width: '100%', marginTop: '0.5rem' }}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
          Don't have an account? Contact Admin.
        </div>
      </div>
    </div>
  );
};

export default Login;
