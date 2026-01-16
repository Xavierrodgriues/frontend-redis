import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  
  // Steps: 
  // 1: Email Input
  // 2: Setup (QR Code)
  // 3: Verify (Enter OTP)
  const [step, setStep] = useState(1);
  const [qrCode, setQrCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

const API_URL = import.meta.env.VITE_API_ORIGIN || 'http://localhost:3000';

  // Step 1: Check Email & Status
  const handleCheckEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/auth-init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to check email');
      
      if (data.totpEnabled) {
        // Assume user has setup, go to Verify step directly
        setStep(3);
      } else {
        // User needs to setup TOTP
        await initiateSetup();
      }
    } catch (err) {
      setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  const initiateSetup = async () => {
    try {
         const res = await fetch(`${API_URL}/api/v1/admin/totp-setup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to start setup');
          
          setQrCode(data.qrCode);
          setStep(2); // Go to Setup Step
    } catch (err) {
        setError(err.message);
    }
  }

  // Step 2 & 3: Verify OTP (for both Setup confirmation and Login)
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/totp-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token: otp })
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

  const renderStep1 = () => (
    <form onSubmit={handleCheckEmail}>
        <div className="input-group">
            <label>Admin Email</label>
            <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            placeholder="Enter admin email"
            />
        </div>
        <button type="submit" className="search-btn" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
            {loading ? 'Checking...' : 'Next'}
        </button>
    </form>
  );

  const renderStep2 = () => ( // Setup
      <div style={{ textAlign: 'center' }}>
          <h3 style={{fontSize: '1.2rem', marginBottom: '1rem'}}>Setup Authenticator</h3>
          <p style={{marginBottom: '1rem', fontSize: '0.9rem', color: '#555'}}>
              Scan this QR code with Google Authenticator or Authy App.
          </p>
          {qrCode && <img src={qrCode} alt="TOTP QR Code" style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '10px', marginBottom: '1rem' }} />}
          
          <form onSubmit={handleVerifyOtp}>
            <div className="input-group">
                <label>Enter 6-digit Code</label>
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
                {loading ? 'Verify & Enable' : 'Verify & Enable'}
            </button>
          </form>
      </div>
  );

  const renderStep3 = () => ( // Login Verify
    <form onSubmit={handleVerifyOtp}>
        <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#666', textAlign: 'center' }}>
        Login as <strong>{email}</strong> <br/>
        <span 
            onClick={() => setStep(1)} 
            style={{ color: '#2563eb', cursor: 'pointer', fontSize: '0.8rem' }}
        >
            Change Email
        </span>
        </div>

        <div className="input-group">
        <label>Authenticator Code</label>
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
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
      <div className="auth-container" style={{maxWidth: '400px', width: '100%'}}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <img src="/yuvii-logo.jpeg" alt="Yuvii Logo" style={{ width: '140px', borderRadius: '1rem' }} />
        </div>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#1a1a1a' }}>Admin Access</h2>
        
        {error && <div className="error-message" style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
        
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        
      </div>
    </div>
  );
}

export default AdminLogin;
