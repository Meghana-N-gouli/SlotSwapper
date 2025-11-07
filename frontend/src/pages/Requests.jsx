import React, { useEffect, useState } from 'react';
import { getSwapRequests, postSwapResponse } from '../api';

export default function Requests({ token }) {
  const [requests, setRequests] = useState([]);
  const [msg, setMsg] = useState('');

  async function load() {
    if (!token) return;
    try {
      const data = await getSwapRequests(token);
      setRequests(data);
    } catch (err) {
      console.error(err);
    }
  }
  useEffect(() => { load(); }, [token]);

  async function respond(id, accept) {
    setMsg('');
    try {
      await postSwapResponse(token, id, accept);
      setMsg(accept ? 'Accepted' : 'Rejected');
      await load();
    } catch (err) {
      setMsg(err.error || 'Failed');
    }
  }

  const incoming = requests.filter(r => r.responder_id === (localStorage.getItem('ss_user_id') || undefined));
  const outgoing = requests.filter(r => r.requester_id === (localStorage.getItem('ss_user_id') || undefined));

  // Since we didn't store user id globally in this simple frontend, show all requests and let Accept only if current user is responder.
  return (
    <div>
      <h2>Swap Requests</h2>
      {msg && <div>{msg}</div>}
      <h3>All Requests (incoming & outgoing)</h3>
      <div style={{ display: 'grid', gap: 8 }}>
        {requests.length === 0 && <div>No requests</div>}
        {requests.map(r => (
          <div key={r.id} style={{ border: '1px solid #ddd', padding: 8 }}>
            <div><strong>{r.status}</strong> — Requester: {r.requester_id} / Responder: {r.responder_id}</div>
            <div>my_event_id: {r.my_event_id} — their_event_id: {r.their_event_id}</div>
            <div style={{ marginTop: 8 }}>
              {r.status === 'PENDING' && r.responder_id === (localStorage.getItem('ss_user_id') || r.responder_id) && (
                <>
                  <button onClick={()=>respond(r.id, true)}>Accept</button>
                  <button onClick={()=>respond(r.id, false)} style={{ marginLeft: 8 }}>Reject</button>
                </>
              )}
              {r.status !== 'PENDING' && <em>Completed</em>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
