const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';

async function api(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw data;
  return data;
}

export async function signup(payload) {
  return api('/auth/signup', { method: 'POST', body: payload });
}
export async function login(payload) {
  return api('/auth/login', { method: 'POST', body: payload });
}
export async function getMe(token) {
  try {
    const data = await api('/events', { token }); // using /events as authenticated probe (returns array)
    // we don't have a /me endpoint — token payload isn't returned here. For simplicity, decode client-side minimal info stored at login
    // So this function will be used mostly to validate token, and Login/Signup will set user object returned by backend.
    return { id: 'ok' }; // placeholder - frontend expects the login/signup handlers to set user
  } catch (err) {
    return null;
  }
}

export async function getMyEvents(token) {
  return api('/events', { token });
}
export async function createEvent(token, payload) {
  return api('/events', { method: 'POST', token, body: payload });
}
export async function updateEvent(token, id, payload) {
  return api(`/events/${id}`, { method: 'PUT', token, body: payload });
}
export async function deleteEvent(token, id) {
  return api(`/events/${id}`, { method: 'DELETE', token });
}

export async function getSwappableSlots(token) {
  return api('/swappable-slots', { token });
}
export async function postSwapRequest(token, body) {
  return api('/swap-request', { method: 'POST', token, body });
}
export async function getSwapRequests(token) {
  return api('/swap-requests', { token });
}
export async function postSwapResponse(token, requestId, accept) {
  return api(`/swap-response/${requestId}`, { method: 'POST', token, body: { accept } });
}
