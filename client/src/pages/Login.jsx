import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import api from '../services/api';

export default function Login() {
  const [step, setStep] = useState('phone'); // phone | otp | dev
  const [phoneDigits, setPhoneDigits] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  // Always prepend +91
  const fullPhone = `+91${phoneDigits}`;

  const handlePhoneChange = (e) => {
    // Only allow digits, max 10
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneDigits(digits);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (phoneDigits.length !== 10) return setError('Enter a valid 10-digit phone number');
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/send-otp', { phone: fullPhone });
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Try dev login.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) return setError('Enter complete OTP');
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/verify-otp', { phone: fullPhone, code });
      login(data.token, data.user);
      navigate(data.isNewUser ? '/profile' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleDevLogin = async (e) => {
    e.preventDefault();
    if (phoneDigits.length !== 10) return setError('Enter a valid 10-digit phone number');
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/dev-login', { phone: fullPhone, name: name || undefined });
      login(data.token, data.user);
      navigate(data.isNewUser ? '/profile' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  return (
    <div className="auth-page">
      <div className="glass-card-static auth-card animate-scaleIn">
        <div style={{ marginBottom: '1.5rem' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 56, height: 56, borderRadius: 'var(--radius-lg)',
            background: 'var(--accent-gradient)', margin: '0 auto 1rem', fontSize: '1.5rem', color: 'white'
          }}>
            <i className="fa-solid fa-code"></i>
          </span>
        </div>

        <h1 className="auth-title">Welcome to DevMatch</h1>
        <p className="auth-subtitle">
          {step === 'phone' ? 'Enter your phone number to get started' :
           step === 'otp' ? `Verify OTP sent to ${fullPhone}` :
           'Quick login for development'}
        </p>

        {error && (
          <div style={{
            background: 'var(--danger-light)', border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 'var(--radius-md)', padding: '0.75rem', marginBottom: '1rem',
            fontSize: '0.875rem', color: 'var(--danger)', textAlign: 'left',
            display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}>
            <i className="fa-solid fa-circle-exclamation"></i>
            {error}
          </div>
        )}

        {step === 'phone' && (
          <form className="auth-form" onSubmit={handleSendOTP}>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div className="input-with-icon phone-input-group">
                <i className="fa-solid fa-phone input-icon"></i>
                <span className="phone-prefix">+91</span>
                <input
                  className="glass-input phone-input-with-prefix"
                  type="tel"
                  placeholder="9876543210"
                  value={phoneDigits}
                  onChange={handlePhoneChange}
                  maxLength={10}
                  autoFocus
                />
              </div>
            </div>
            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
              {loading ? (
                <><div className="loader" style={{ width: 18, height: 18, borderWidth: 2 }}></div> Sending...</>
              ) : (
                <><i className="fa-solid fa-paper-plane"></i> Send OTP</>
              )}
            </button>

            <div className="auth-divider">or</div>

            <button className="btn btn-secondary btn-full" type="button" onClick={() => setStep('dev')}>
              <i className="fa-solid fa-terminal"></i>
              Dev Login (No OTP)
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form className="auth-form" onSubmit={handleVerifyOTP}>
            <div className="otp-inputs">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  className="otp-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  autoFocus={i === 0}
                />
              ))}
            </div>
            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
              {loading ? (
                <><div className="loader" style={{ width: 18, height: 18, borderWidth: 2 }}></div> Verifying...</>
              ) : (
                <><span className="material-symbols-outlined">verified</span> Verify OTP</>
              )}
            </button>
            <button className="btn btn-ghost btn-full" type="button" onClick={() => { setStep('phone'); setOtp(['','','','','','']); }}>
              <i className="fa-solid fa-arrow-left"></i> Change Number
            </button>
          </form>
        )}

        {step === 'dev' && (
          <form className="auth-form" onSubmit={handleDevLogin}>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div className="input-with-icon phone-input-group">
                <i className="fa-solid fa-phone input-icon"></i>
                <span className="phone-prefix">+91</span>
                <input
                  className="glass-input phone-input-with-prefix"
                  type="tel"
                  placeholder="9876543210"
                  value={phoneDigits}
                  onChange={handlePhoneChange}
                  maxLength={10}
                  autoFocus
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Name (optional)</label>
              <div className="input-with-icon">
                <i className="fa-solid fa-user input-icon"></i>
                <input
                  className="glass-input"
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            </div>
            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
              {loading ? (
                <><div className="loader" style={{ width: 18, height: 18, borderWidth: 2 }}></div> Logging in...</>
              ) : (
                <><i className="fa-solid fa-right-to-bracket"></i> Quick Login</>
              )}
            </button>
            <button className="btn btn-ghost btn-full" type="button" onClick={() => setStep('phone')}>
              <i className="fa-solid fa-arrow-left"></i> Back to OTP
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
