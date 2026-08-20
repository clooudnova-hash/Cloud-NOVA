import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!/^[a-z0-9](?:[a-z0-9._%+-]*[a-z0-9])?@gmail\.com$/i.test(formData.email.trim())) { setErrorMessage('Please login with a valid Gmail address.'); return; }
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('userName', data.user.fullName);
        navigate('/');
      } else {
        setErrorMessage(data.message || 'Invalid credentials.');
      }
    } catch {
      setErrorMessage('Unable to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #020510 0%, #0a0f2e 50%, #020510 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Inter', -apple-system, sans-serif"
    }}>
      {/* Background glow orbs */}
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(0,180,255,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(120,40,255,0.07) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '18px',
            background: 'linear-gradient(135deg, rgba(0,180,255,0.15), rgba(120,40,255,0.15))',
            border: '1px solid rgba(0,180,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', marginBottom: '14px',
            boxShadow: '0 0 30px rgba(0,180,255,0.15)'
          }}>☁️</div>
          <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: '800', letterSpacing: '3px', margin: 0, background: 'linear-gradient(90deg, #00b4ff, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CLOUDNOVA</h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', marginTop: '4px', letterSpacing: '1px' }}>CLOUD MINING PLATFORM</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '24px',
          padding: '36px 32px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)'
        }}>
          <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', margin: '0 0 4px 0' }}>Welcome back</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: '0 0 28px 0' }}>Sign in to your account</p>

          {errorMessage && (
            <div style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
              color: '#f87171', fontSize: '13px', padding: '12px 16px',
              borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <span>⚠️</span> {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

            {/* Email */}
            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: '600', marginBottom: '8px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', opacity: 0.5 }}>✉️</span>
                <input
                  type="email" name="email" value={formData.email} onChange={handleChange} required
                  placeholder="you@example.com"
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                    padding: '13px 14px 13px 42px', color: '#fff', fontSize: '14px',
                    boxSizing: 'border-box', outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,180,255,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: '600', marginBottom: '8px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', opacity: 0.5 }}>🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required
                  placeholder="••••••••"
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                    padding: '13px 44px 13px 42px', color: '#fff', fontSize: '14px',
                    boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,180,255,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', opacity: 0.5, padding: 0 }}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              width: '100%',
              background: loading ? 'rgba(255,255,255,0.07)' : 'linear-gradient(135deg, #00b4ff, #7c3aed)',
              border: 'none', borderRadius: '12px', padding: '14px',
              color: '#fff', fontSize: '15px', fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px',
              letterSpacing: '0.5px',
              boxShadow: loading ? 'none' : '0 8px 24px rgba(0,180,255,0.2)',
              transition: 'all 0.2s'
            }}>
              {loading ? '⏳  Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '24px 0' }} />

          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', textAlign: 'center', margin: 0 }}>
            Don't have an account?{' '}
            <button type="button" onClick={() => navigate('/register')}
              style={{ background: 'none', border: 'none', color: '#00b4ff', fontWeight: '600', cursor: 'pointer', padding: 0, fontSize: '13px' }}>
              Create one free →
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
