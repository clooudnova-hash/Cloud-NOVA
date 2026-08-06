import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const getStrength = (p) => {
  if (!p) return null;
  let s = 0;
  if (p.length >= 6) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  if (s <= 1) return { pct: '33%', color: '#ef4444', label: 'Weak' };
  if (s <= 3) return { pct: '66%', color: '#f59e0b', label: 'Medium' };
  return { pct: '100%', color: '#10b981', label: 'Strong 🛡️' };
};

export default function ChangePassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ current: '', newPass: '', confirm: '' });
  const [show, setShow] = useState({ current: false, newPass: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');

  const strength = getStrength(form.newPass);
  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) { navigate('/login'); return; }
    if (form.newPass !== form.confirm) { setMsg('New passwords do not match.'); setMsgType('error'); return; }
    if (form.newPass.length < 6) { setMsg('New password must be at least 6 characters.'); setMsgType('error'); return; }
    setLoading(true); setMsg('');
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', authorization: token },
        body: JSON.stringify({ currentPassword: form.current, newPassword: form.newPass })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMsg('✅ Password changed successfully!');
        setMsgType('success');
        setForm({ current: '', newPass: '', confirm: '' });
        setTimeout(() => navigate('/profile'), 2000);
      } else {
        setMsg('❌ ' + (data.message || 'Failed to change password.'));
        setMsgType('error');
      }
    } catch {
      setMsg('❌ Network error. Please try again.');
      setMsgType('error');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px',
    padding: '13px 44px 13px 14px', color: '#1e293b', fontSize: '14px',
    boxSizing: 'border-box', outline: 'none',
  };

  const fields = [
    { key: 'current', label: 'Current Password', placeholder: '••••••••' },
    { key: 'newPass', label: 'New Password', placeholder: 'Min. 6 characters' },
    { key: 'confirm', label: 'Confirm New Password', placeholder: 'Repeat new password' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f5f8ff', fontFamily: 'Inter, -apple-system, sans-serif', paddingBottom: '100px' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', margin: '12px 16px', padding: '20px', borderRadius: '20px', color: '#fff', boxShadow: '0 4px 20px rgba(59,130,246,0.3)' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px', fontWeight: '700', padding: '6px 14px', cursor: 'pointer', marginBottom: '12px' }}>← Back</button>
        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Account Security</p>
        <h2 style={{ fontSize: '22px', fontWeight: '900', margin: '4px 0 0' }}>🔒 Change Password</h2>
      </div>

      {/* Form */}
      <div style={{ background: '#fff', borderRadius: '20px', margin: '0 16px', padding: '24px', border: '1px solid #e8eef8', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        {msg && (
          <div style={{ background: msgType === 'success' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${msgType === 'success' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`, color: msgType === 'success' ? '#059669' : '#dc2626', fontSize: '13px', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', fontWeight: '600' }}>
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {fields.map(f => (
            <div key={f.key}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{f.label}</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={show[f.key] ? 'text' : 'password'}
                  value={form[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  required
                  style={{ ...inputStyle, borderColor: f.key === 'confirm' && form.confirm && form.newPass !== form.confirm ? '#fca5a5' : '#e2e8f0' }}
                />
                <button type="button" onClick={() => setShow(p => ({ ...p, [f.key]: !p[f.key] }))}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', opacity: 0.5, padding: 0 }}>
                  {show[f.key] ? '🙈' : '👁️'}
                </button>
              </div>
              {f.key === 'newPass' && strength && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ width: '100%', height: '3px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ width: strength.pct, height: '100%', background: strength.color, borderRadius: '99px', transition: 'all 0.3s' }} />
                  </div>
                  <span style={{ fontSize: '11px', color: strength.color, fontWeight: '600', marginTop: '4px', display: 'block' }}>{strength.label}</span>
                </div>
              )}
              {f.key === 'confirm' && form.confirm && form.newPass !== form.confirm && (
                <span style={{ fontSize: '11px', color: '#ef4444', display: 'block', marginTop: '4px', fontWeight: '600' }}>Passwords do not match</span>
              )}
            </div>
          ))}

          <button type="submit" disabled={loading} style={{
            width: '100%', background: loading ? '#e2e8f0' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            border: 'none', borderRadius: '12px', padding: '14px',
            color: loading ? '#94a3b8' : '#fff', fontSize: '14px', fontWeight: '800',
            cursor: loading ? 'not-allowed' : 'pointer', marginTop: '4px',
            boxShadow: loading ? 'none' : '0 4px 15px rgba(59,130,246,0.3)', letterSpacing: '0.5px'
          }}>
            {loading ? '⏳ Updating...' : '🔒 Update Password'}
          </button>
        </form>
      </div>

      <div style={{ margin: '16px', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '14px', padding: '14px 16px' }}>
        <p style={{ fontSize: '12px', color: '#92400e', fontWeight: '600', margin: 0, lineHeight: '1.5' }}>
          ⚠️ After changing your password, you will remain logged in on this device. Other devices will require you to sign in again.
        </p>
      </div>
    </div>
  );
}
