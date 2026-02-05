import { useState } from 'react';
import RoleSuggestions from './RoleSuggestions';

const Register = ({ onLogin, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!role) {
        throw new Error('Please select a job role');
      }

      const response = await fetch('http://localhost:3000/api/v1/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <img src="/yuvii-logo.jpeg" alt="Yuvii Logo" style={{ width: '140px', borderRadius: '1rem' }} />
      </div>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#1a1a1a' }}>Create Account</h2>

      {error && <div className="error-message" style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="reg-email">Email Address</label>
          <input
            type="email"
            id="reg-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />
        </div>

        <RoleSuggestions
          value={role}
          onChange={setRole}
          onSelect={setRole}
        />
        <div className="auth-helper-text">
          * We will send an OTP to this email for login.
        </div>

        <button type="submit" className="search-btn" disabled={isLoading} style={{ width: '100%', marginTop: '0.5rem' }}>
          {isLoading ? 'Creating Account...' : 'Register'}
        </button>
      </form>

      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: '#666' }}>
        Already have an account?{' '}
        <span
          onClick={() => onNavigate('login')}
          style={{ color: '#2563eb', cursor: 'pointer', fontWeight: '500' }}
        >
          Sign in
        </span>
      </div>
    </div>
  );
};

export default Register;
