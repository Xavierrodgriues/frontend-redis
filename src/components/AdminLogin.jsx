import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('https://redis-jobseeker-backend.onrender.com/api/v1/admin/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('https://redis-jobseeker-backend.onrender.com/api/v1/admin/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('job_admin', JSON.stringify(data.admin));
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
      <div className="auth-container">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <img src="/yuvii-logo.jpeg" alt="Yuvii Logo" style={{ width: '140px', borderRadius: '1rem' }} />
        </div>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#1a1a1a' }}>Admin Panel Login</h2>
        
        {error && <div className="error-message" style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
        
        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
            <div className="input-group">
              <label>Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="Enter admin email"
              />
            </div>
            <button type="submit" className="search-btn" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
              {loading ? 'Sending...' : 'Send OTP'}
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
              <label>Enter OTP</label>
              <input 
                type="text" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
                required 
                placeholder="123456"
                maxLength="6"
                 style={{ letterSpacing: '0.5em', textAlign: 'center', fontSize: '1.2rem' }}
              />
            </div>
            <button type="submit" className="search-btn" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
              {loading ? 'Verifying...' : 'Login'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default AdminLogin;
