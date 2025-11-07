import React, { useState } from 'react';
import { signup } from '../api';
import { useNavigate } from 'react-router-dom';

export default function Signup({ onLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  async function handle(e) {
    e.preventDefault();
    setErr('');
    try {
      const res = await signup({ name, email, password });
      // res: { token, user }
      localStorage.setItem('ss_token', res.token);
      onLogin(res.token, res.user);
      navigate('/');
    } catch (err) {
      setErr(err.error || 'Signup failed');
    }
  }

  return (
    <div style={{ maxWidth: 420 }}>
      <h2>Signup</h2>
      <form onSubmit={handle}>
        <div><input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" /></div>
        <div><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" /></div>
        <div><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" /></div>
        <div style={{ marginTop: 8 }}>
          <button type="submit">Signup</button>
        </div>
        {err && <div style={{ color: 'red' }}>{err}</div>}
      </form>
    </div>
  );
}
