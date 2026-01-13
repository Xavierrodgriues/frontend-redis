import { useState } from 'react';

const Login = ({ onLogin, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1 = Input Email, 2 = Input OTP
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('https://redis-jobseeker-backend.onrender.com/api/v1/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send OTP');

      setStep(2);
      // alert(data.message); // Optional feedback
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('https://redis-jobseeker-backend.onrender.com/api/v1/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
      <div className="auth-container">
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <img src="/yuvii-logo.jpeg" alt="Yuvii Logo" style={{ width: '140px', borderRadius: '1rem' }} />
      </div>
      <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#1a1a1a' }}>Welcome Back</h2>
      
      {error && <div className="error-message" style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}

      {step === 1 ? (
        <form onSubmit={handleSendOtp}>
          <div className="input-group">
            <label htmlFor="username">Email Address</label>
            <input
              type="email"
              id="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your registered email"
            />
          </div>
          <button type="submit" className="search-btn" disabled={isLoading} style={{ width: '100%', marginTop: '1rem' }}>
            {isLoading ? 'Sending OTP...' : 'Get OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp}>
           <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#666', textAlign: 'center' }}>
            OTP sent to <strong>{email}</strong> <br/>
            <span 
              onClick={() => setStep(1)} 
              style={{ color: '#2563eb', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              Change Email
            </span>
          </div>

          <div className="input-group">
            <label htmlFor="otp">Enter OTP</label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              placeholder="123456"
              maxLength="6"
              style={{ letterSpacing: '0.5em', textAlign: 'center', fontSize: '1.2rem' }}
            />
          </div>
          <button type="submit" className="search-btn" disabled={isLoading} style={{ width: '100%', marginTop: '1rem' }}>
            {isLoading ? 'Verifying...' : 'Sign In'}
          </button>
        </form>
      )}

      {/* Registration Disabled */}
      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: '#666' }}>
        Don't have an account? Contact Admin.
      </div>
      </div>
    </div>
  );
};

export default Login;
