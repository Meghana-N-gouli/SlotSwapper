import React, { useState } from 'react';
import { login } from '../api';
import { useNavigate } from 'react-router-dom';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  async function handle(e) {
    e.preventDefault();
    setErr('');
    try {
      const res = await login({ email, password });
      // res: { token, user }
      localStorage.setItem('ss_token', res.token);
      onLogin(res.token, res.user);
      navigate('/');
    } catch (err) {
      setErr(err.error || 'Login failed');
    }
  }

  return (
    <div style={{ maxWidth: 420 }}>
      <h2>Login</h2>
      <form onSubmit={handle}>
        <div><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" /></div>
        <div><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" /></div>
        <div style={{ marginTop: 8 }}>
          <button type="submit">Login</button>
        </div>
        {err && <div style={{ color: 'red' }}>{err}</div>}
      </form>
    </div>
  );
}
