// src/components/admin/AdminLogin.tsx
import React, { useState } from 'react';

const TEAL = '#008c8c';

interface AdminLoginProps {
  onLogin: () => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        onLogin();
      } else {
        setError('密码错误，请重试');
      }
    } catch {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
      <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 4px 24px rgba(0,0,0,0.12)', width: '360px', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ background: TEAL, padding: '24px 32px', textAlign: 'center', color: '#fff' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>🎵</div>
          <div style={{ fontSize: '17px', fontWeight: 'bold' }}>湖北文理学院</div>
          <div style={{ fontSize: '13px', opacity: 0.9, marginTop: '2px' }}>音乐与舞蹈学院 · 后台管理</div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '28px 32px' }}>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#555', marginBottom: '6px' }}>
              管理密码
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="请输入管理密码"
              autoFocus
              style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '4px', padding: '8px 12px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => (e.target.style.borderColor = TEAL)}
              onBlur={e => (e.target.style.borderColor = '#d1d5db')}
            />
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '13px', padding: '8px 12px', borderRadius: '4px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', background: TEAL, color: '#fff', border: 'none', borderRadius: '4px', padding: '10px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? '登录中...' : '登 录'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <a href="/course/chorus-conducting" style={{ fontSize: '12px', color: '#888', textDecoration: 'none' }}>
              ← 返回前台页面
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
