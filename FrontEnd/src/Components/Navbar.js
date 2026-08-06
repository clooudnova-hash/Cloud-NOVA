import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <header style={{
      backgroundColor: '#171923',
      borderBottom: '1px solid #2d3748',
      padding: '12px 16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <Link to="/" style={{ color: '#ecc94b', fontWeight: '900', fontSize: '18px', textDecoration: 'none', letterSpacing: '1px' }}>
        CLOUDNOVA
      </Link>
      
      <div style={{ display: 'flex', gap: '8px' }}>
        <Link to="/profile" style={{ fontSize: '11px', color: '#a0aec0', backgroundColor: 'rgba(45,55,72,0.4)', padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(74,85,104,0.2)', textDecoration: 'none' }}>
          Login
        </Link>
        <Link to="/profile" style={{ fontSize: '11px', fontWeight: 'bold', color: '#000', backgroundImage: 'linear-gradient(to right, #ecc94b, #dd6b20)', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none', boxShadow: '0 4px 6px rgba(236,201,75,0.1)' }}>
          Sign Up
        </Link>
      </div>
    </header>
  );
}
