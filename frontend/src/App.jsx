import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import Login from './auth/Login';
import Signup from './auth/Signup';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import Requests from './pages/Requests';
import { getMe } from './api';

function Nav({ user, setUser, onLogout }) {
  return (
    <nav style={{ display: 'flex', gap: 12, padding: 12, borderBottom: '1px solid #eee' }}>
      <Link to="/">Dashboard</Link>
      <Link to="/marketplace">Marketplace</Link>
      <Link to="/requests">Requests</Link>
      <div style={{ marginLeft: 'auto' }}>
        {user ? (
          <>
            <span style={{ marginRight: 8 }}>Hi, {user.name}</span>
            <button onClick={onLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link> <Link to="/signup">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('ss_token'));
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      getMe(token).then(res => {
        if (res?.id) setUser(res);
        else {
          setToken(null);
          setUser(null);
          localStorage.removeItem('ss_token');
        }
      }).catch(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('ss_token');
      });
    }
  }, [token]);

  function onLogin(tkn, user) {
    setToken(tkn);
    localStorage.setItem('ss_token', tkn);
    setUser(user);
    navigate('/');
  }
  function onLogout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem('ss_token');
    navigate('/login');
  }

  return (
    <div>
      <Nav user={user} setUser={setUser} onLogout={onLogout} />
      <div style={{ padding: 20 }}>
        <Routes>
          <Route path="/" element={<Dashboard token={token} />} />
          <Route path="/marketplace" element={<Marketplace token={token} />} />
          <Route path="/requests" element={<Requests token={token} />} />
          <Route path="/login" element={<Login onLogin={onLogin} />} />
          <Route path="/signup" element={<Signup onLogin={onLogin} />} />
        </Routes>
      </div>
    </div>
  );
}
