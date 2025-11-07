import React, { useEffect, useState } from 'react';
import { getSwappableSlots, getMyEvents, postSwapRequest } from '../api';
import EventCard from '../components/EventCard';

export default function Marketplace({ token }) {
  const [slots, setSlots] = useState([]);
  const [mySwappables, setMySwappables] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [selectedMine, setSelectedMine] = useState('');
  const [msg, setMsg] = useState('');

  async function load() {
    if (!token) return;
    try {
      const s = await getSwappableSlots(token);
      setSlots(s);
      const mine = await getMyEvents(token);
      setMySwappables(mine.filter(m => m.status === 'SWAPPABLE'));
    } catch (err) {
      console.error(err);
    }
  }
  useEffect(() => { load(); }, [token]);

  async function requestSwap() {
    setMsg('');
    if (!selectedTarget || !selectedMine) {
      setMsg('Choose your swappable slot to offer');
      return;
    }
    try {
      await postSwapRequest(token, { mySlotId: selectedMine, theirSlotId: selectedTarget.id });
      setMsg('Swap request sent');
      setSelectedTarget(null);
      setSelectedMine('');
      await load();
    } catch (err) {
      setMsg(err.error || 'Failed to send');
    }
  }

  return (
    <div>
      <h2>Marketplace</h2>
      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ flex: 2 }}>
          <h3>Available Swappable Slots</h3>
          {slots.length === 0 && <div>No external swappable slots</div>}
          <div style={{ display: 'grid', gap: 8 }}>
            {slots.map(s => (
              <EventCard key={s.id} ev={s}>
                <button onClick={() => { setSelectedTarget(s); setMsg(''); }}>Request Swap</button>
              </EventCard>
            ))}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <h3>Your swappable slots</h3>
          <div>
            <select value={selectedMine} onChange={e=>setSelectedMine(e.target.value)}>
              <option value="">-- pick your swappable slot --</option>
              {mySwappables.map(m => <option key={m.id} value={m.id}>{m.title} ({m.startTime})</option>)}
            </select>
            <div style={{ marginTop: 8 }}>
              <button onClick={requestSwap} disabled={!selectedTarget}>Send Swap Request</button>
            </div>
            {selectedTarget && <div style={{ marginTop: 8 }}>Offering to swap with: <strong>{selectedTarget.title} ({selectedTarget.startTime})</strong></div>}
            {msg && <div style={{ marginTop: 8 }}>{msg}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
