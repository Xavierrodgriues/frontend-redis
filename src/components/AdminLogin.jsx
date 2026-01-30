import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminLogin() {
  const [email, setEmail] = useState('');
  // Instead of a single string, we can still keep the single string state for validation,
  // but we'll manage the 6 separate inputs via refs or local state for rendering.
  // Actually, easiest is to map an array of 6 strings.
  const [otp, setOtp] = useState(new Array(6).fill(""));

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
  const inputRefs = useRef([]);

  // Helper to focus next or prev input
  const focusInput = (index) => {
    if (inputRefs.current[index]) {
      inputRefs.current[index].focus();
    }
  };

  // Auto-focus first input when step changes to OTP entry (Step 2 or 3)
  useEffect(() => {
    if ((step === 2 || step === 3) && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [step]);

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
        setStep(3);
      } else {
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
      setStep(2);
    } catch (err) {
      setError(err.message);
    }
  }

  // Handle Verify
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const token = otp.join("");
    if (token.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/v1/admin/totp-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token })
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

  // OTP Input Handlers
  const handleChange = (element, index) => {
    let val = element.value;
    // Ensure only numbers
    if (!/^\d*$/.test(val)) return;

    // If content exists and new char entered, take the LAST char (overwrite behavior)
    if (val.length > 1) {
      val = val.slice(-1);
    }

    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Focus next input
    if (val !== "" && index < 5) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (e, index) => {
    // Handle Backspace
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        focusInput(index - 1);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusInput(index - 1);
    } else if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      focusInput(index + 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return; // Only digits

    const newOtp = [...otp];
    pastedData.split("").forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);
    // Focus last filled index
    focusInput(Math.min(pastedData.length, 5));
  };


  const renderOtpInputs = () => (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '1.5rem' }}>
      {otp.map((data, index) => (
        <input
          key={index}
          ref={el => inputRefs.current[index] = el}
          type="text"
          // maxLength removed to allow overwrite logic in handleChange
          value={data}
          onChange={e => handleChange(e.target, index)}
          onKeyDown={e => handleKeyDown(e, index)}
          onPaste={index === 0 ? handlePaste : undefined} // Allow paste on first box
          onClick={(e) => { }} // Remove selection
          style={{
            width: '40px',
            height: '48px',
            fontSize: '1.25rem',
            textAlign: 'center',
            borderRadius: '8px',
            border: '1px solid #ccc',
            outline: 'none',
            transition: 'border-color 0.2s',
            caretColor: 'transparent', // Hide cursor
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#2563eb';
          }}
          onBlur={(e) => e.target.style.borderColor = '#ccc'}
        />
      ))}
    </div>
  );

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
      <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Setup Authenticator</h3>
      <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#555' }}>
        Scan this QR code with Google Authenticator or Authy App.
      </p>
      {qrCode && <img src={qrCode} alt="TOTP QR Code" style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '10px', marginBottom: '1rem' }} />}

      <form onSubmit={handleVerifyOtp}>
        <label style={{ display: 'block', marginBottom: '0.5rem', textAlign: 'left', fontWeight: '500' }}>Enter 6-digit Code</label>
        {renderOtpInputs()}

        <button type="submit" className="search-btn" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Verify & Enable' : 'Verify & Enable'}
        </button>
      </form>
    </div>
  );

  const renderStep3 = () => ( // Login Verify
    <form onSubmit={handleVerifyOtp}>
      <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#666', textAlign: 'center' }}>
        Login as <strong>{email}</strong> <br />
        <span
          onClick={() => setStep(1)}
          style={{ color: '#2563eb', cursor: 'pointer', fontSize: '0.8rem' }}
        >
          Change Email
        </span>
      </div>

      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Authenticator Code</label>
      {renderOtpInputs()}

      <button type="submit" className="search-btn" disabled={loading} style={{ width: '100%' }}>
        {loading ? 'Verifying...' : 'Login'}
      </button>
    </form>
  );

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
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#0f172a', fontSize: '1.25rem', fontWeight: '600' }}>Admin Access</h2>

        {error && <div style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '0.625rem 0.875rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.8rem' }}>{error}</div>}

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

      </div>
    </div>
  );
}

export default AdminLogin;
