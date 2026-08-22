import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const inputStyle = {
  width: '100%', background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
  padding: '13px 14px 13px 42px', color: '#fff', fontSize: '14px',
  boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s'
};
const labelStyle = {
  display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '12px',
  fontWeight: '600', marginBottom: '8px', letterSpacing: '0.5px', textTransform: 'uppercase'
};

function Icon({ emoji }) {
  return <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', opacity: 0.5 }}>{emoji}</span>;
}

function Field({ label, icon, children }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: 'relative' }}>
        <Icon emoji={icon} />
        {children}
      </div>
    </div>
  );
}

function focusOn(e) { e.target.style.borderColor = 'rgba(0,180,255,0.5)'; }
function focusOff(e) { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }

const getPasswordStrength = (pass) => {
  if (!pass) return null;
  let score = 0;
  if (pass.length >= 6) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;
  if (score <= 1) return { pct: '33%', color: '#ef4444', label: 'Weak' };
  if (score <= 3) return { pct: '66%', color: '#f59e0b', label: 'Medium' };
  return { pct: '100%', color: '#10b981', label: 'Strong 🛡️' };
};

export default function Register() {
  const navigate = useNavigate();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', confirmPassword: '', referralCode: '', agreeToTerms: false
  });
  const [referralLocked, setReferralLocked] = useState(false);

  useEffect(() => {
    const referral = new URLSearchParams(window.location.search).get('ref');
    if (referral) {
      setFormData(prev => ({ ...prev, referralCode: referral }));
      setReferralLocked(true);
    }
  }, []);

  const strength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^[a-z0-9](?:[a-z0-9._%+-]*[a-z0-9])?@gmail\.com$/i.test(formData.email.trim())) { setError('Please use a valid Gmail address ending in @gmail.com.'); return; }
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match.'); return; }
    if (!formData.agreeToTerms) { setError('Please accept the Terms of Service.'); return; }
    setSubmitLoading(true);
    try {
      // Check email uniqueness first
      const otpRes = await fetch('/api/auth/send-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      const otpData = await otpRes.json();
      if (!otpRes.ok) { setError(otpData.message || 'Email check failed.'); setSubmitLoading(false); return; }

      // Register
      const res = await fetch('/api/auth/signup', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName, email: formData.email,
          password: formData.password, referralCode: formData.referralCode,
          otpCode: '000000'
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess('Account created! Redirecting to login…');
        setTimeout(() => navigate('/login'), 1800);
      } else { setError(data.message || 'Registration failed.'); }
    } catch { setError('Network error. Please try again.'); }
    finally { setSubmitLoading(false); }
  };

  return (
    <div className="premium-page auth-page" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #020510 0%, #0a0f2e 50%, #020510 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px', boxSizing: 'border-box', position: 'relative', overflow: 'hidden',
      fontFamily: "'Inter', -apple-system, sans-serif"
    }}>
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(0,180,255,0.07) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(120,40,255,0.06) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div className="auth-content" style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '18px',
            background: 'linear-gradient(135deg, rgba(0,180,255,0.15), rgba(120,40,255,0.15))',
            border: '1px solid rgba(0,180,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px',
            marginBottom: '14px', boxShadow: '0 0 30px rgba(0,180,255,0.15)'
          }}>
            <img src="/logo.png" alt="CloudNova" style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '14px' }} />
          </div>
          <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: '800', letterSpacing: '3px', margin: 0, background: 'linear-gradient(90deg, #00b4ff, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CLOUDNOVA</h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', marginTop: '4px', letterSpacing: '1px' }}>JOIN 180,000+ MINERS WORLDWIDE</p>
        </div>

        {/* Card */}
        <div className="auth-card" style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '24px', padding: '36px 32px', backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)'
        }}>
          <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', margin: '0 0 4px 0' }}>Create your account</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: '0 0 24px 0' }}>Fill in your details to get started</p>

          {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', fontSize: '13px', padding: '12px 16px', borderRadius: '12px', marginBottom: '16px' }}>⚠️ {error}</div>}
          {success && <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', color: '#34d399', fontSize: '13px', padding: '12px 16px', borderRadius: '12px', marginBottom: '16px' }}>✅ {success}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <Field label="Full Name" icon="👤">
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange}
                placeholder="John Doe" required style={inputStyle}
                onFocus={focusOn} onBlur={focusOff} />
            </Field>

            <Field label="Email Address" icon="✉️">
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                placeholder="you@example.com" required style={inputStyle}
                onFocus={focusOn} onBlur={focusOff} />
            </Field>

            {/* Password */}
            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <Icon emoji="🔒" />
                <input type={showPassword ? 'text' : 'password'} name="password"
                  value={formData.password} onChange={handleChange} placeholder="Min. 8 characters" required
                  style={{ ...inputStyle, paddingRight: '44px' }}
                  onFocus={focusOn} onBlur={focusOff} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', opacity: 0.5, padding: 0 }}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {strength && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ width: strength.pct, height: '100%', background: strength.color, borderRadius: '99px', transition: 'all 0.3s' }} />
                  </div>
                  <span style={{ fontSize: '11px', color: strength.color, fontWeight: '600', marginTop: '4px', display: 'block' }}>{strength.label}</span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label style={labelStyle}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Icon emoji="🔒" />
                <input type={showConfirm ? 'text' : 'password'} name="confirmPassword"
                  value={formData.confirmPassword} onChange={handleChange} placeholder="Repeat password" required
                  style={{ ...inputStyle, paddingRight: '44px', borderColor: formData.confirmPassword && formData.password !== formData.confirmPassword ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)' }}
                  onFocus={focusOn} onBlur={focusOff} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', opacity: 0.5, padding: 0 }}>
                  {showConfirm ? '🙈' : '👁️'}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <span style={{ fontSize: '11px', color: '#f87171', display: 'block', marginTop: '4px' }}>Passwords do not match</span>
              )}
            </div>

            <Field label={<>Referral Code <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: '400', textTransform: 'none' }}>(optional)</span></>} icon="🎁">
              <input type="text" name="referralCode" value={formData.referralCode} onChange={handleChange}
                placeholder="e.g. CloudNova" readOnly={referralLocked} disabled={referralLocked} style={{ ...inputStyle, opacity: referralLocked ? 0.7 : 1, cursor: referralLocked ? 'not-allowed' : 'text' }}
                onFocus={focusOn} onBlur={focusOff} />
            </Field>

            {/* Terms */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleChange}
                style={{ marginTop: '2px', accentColor: '#00b4ff', width: '16px', height: '16px', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: '1.5' }}>
                I agree to the <span style={{ color: '#00b4ff', cursor: 'pointer' }}>Terms of Service</span> and <span style={{ color: '#00b4ff', cursor: 'pointer' }}>Privacy Policy</span>
              </span>
            </label>

            <button type="submit" disabled={submitLoading} style={{
              width: '100%',
              background: submitLoading ? 'rgba(255,255,255,0.07)' : 'linear-gradient(135deg, #00b4ff, #7c3aed)',
              border: 'none', borderRadius: '12px', padding: '14px',
              color: '#fff', fontSize: '15px', fontWeight: '700',
              cursor: submitLoading ? 'not-allowed' : 'pointer', marginTop: '4px',
              boxShadow: submitLoading ? 'none' : '0 8px 24px rgba(0,180,255,0.2)',
              transition: 'all 0.2s'
            }}>
              {submitLoading ? '⏳  Creating account...' : 'Create Account →'}
            </button>
          </form>

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '24px 0' }} />
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', textAlign: 'center', margin: 0 }}>
            Already have an account?{' '}
            <button type="button" onClick={() => navigate('/login')}
              style={{ background: 'none', border: 'none', color: '#00b4ff', fontWeight: '600', cursor: 'pointer', padding: 0, fontSize: '13px' }}>
              Sign in →
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
