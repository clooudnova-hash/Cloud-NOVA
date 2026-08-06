import React from 'react';
import { useNavigate } from 'react-router-dom';

const Support = () => {
  const navigate = useNavigate();

  const channels = [
    { icon: '✉️', label: 'Email', value: 'cloudnovaofficial1@gmail.com', href: 'mailto:cloudnovaofficial1@gmail.com', color: '#00b4ff', bg: 'rgba(0,180,255,0.10)' },
    { icon: '📢', label: 'WhatsApp Channel', value: 'Join Our Official Channel', href: 'https://whatsapp.com/channel/0029Vb8CeqrG8l57aaUcYd3s', color: '#25d366', bg: 'rgba(37,211,102,0.10)' },
  ];

  const faqs = [
    { q: 'How long does deposit approval take?', a: 'Deposits are reviewed within 1–4 hours during business hours (10 AM – 9 PM).' },
    { q: 'When are withdrawals processed?', a: 'Withdrawals are processed Monday–Friday, 10 AM – 9 PM. Please allow up to 24 hours.' },
    { q: 'My balance is wrong — what do I do?', a: 'Please contact support via email (cloudnovaofficial1@gmail.com) with your transaction ID and we will resolve it within 2 hours.' },
    { q: 'How do I earn with referrals?', a: 'You earn 6% on Level 1, 4% on Level 2, and 2% on Level 3 team deposits. Share your referral code from the Profile page.' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f5f8ff', fontFamily: 'Inter, -apple-system, sans-serif', paddingBottom: '100px' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', margin: '12px 16px', padding: '20px', borderRadius: '20px', color: '#fff', boxShadow: '0 4px 20px rgba(59,130,246,0.3)' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px', fontWeight: '700', padding: '6px 14px', cursor: 'pointer', marginBottom: '12px' }}>← Back</button>
        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Customer Support</p>
        <h2 style={{ fontSize: '22px', fontWeight: '900', margin: '4px 0 0' }}>🎧 We're Here to Help</h2>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', margin: '6px 0 0', fontWeight: '500' }}>Available daily 10:00 AM – 9:00 PM</p>
      </div>

      {/* Contact Channels */}
      <div style={{ background: '#fff', borderRadius: '20px', margin: '0 16px 16px', padding: '20px', border: '1px solid #e8eef8', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <h3 style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 16px' }}>Contact Channels</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {channels.map(c => (
            <div key={c.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: c.bg, borderRadius: '14px', padding: '14px 16px', border: `1px solid ${c.color}22` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '22px' }}>{c.icon}</span>
                <div>
                  <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', margin: 0 }}>{c.label}</p>
                  <p style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b', margin: '2px 0 0', fontFamily: 'monospace' }}>{c.value}</p>
                </div>
              </div>
              {c.href && (
                <a href={c.href} target="_blank" rel="noreferrer"
                  style={{ background: c.color, color: '#fff', fontSize: '11px', fontWeight: '800', padding: '8px 16px', borderRadius: '10px', textDecoration: 'none', textTransform: 'uppercase' }}>
                  Open
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <div style={{ background: '#fff', borderRadius: '20px', margin: '0 16px', padding: '20px', border: '1px solid #e8eef8', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <h3 style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 16px' }}>Frequently Asked Questions</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqs.map((f, i) => (
            <div key={i} style={{ background: '#f8fafc', borderRadius: '14px', padding: '14px 16px', border: '1px solid #e2e8f0' }}>
              <p style={{ fontSize: '12px', fontWeight: '800', color: '#1e293b', margin: '0 0 6px' }}>Q: {f.q}</p>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: '1.5' }}>A: {f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Support;
