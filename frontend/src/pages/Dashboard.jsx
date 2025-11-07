import React, { useEffect, useState } from 'react';
import { getMyEvents, createEvent, updateEvent } from '../api';
import EventCard from '../components/EventCard';

export default function Dashboard({ token }) {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ title: '', startTime: '', endTime: '', status: 'BUSY' });
  const [err, setErr] = useState('');

  async function load() {
    if (!token) return;
    try {
      const data = await getMyEvents(token);
      setEvents(data);
    } catch (err) {
      console.error(err);
      setErr(err.error || 'Failed to load');
    }
  }
  useEffect(() => { load(); }, [token]);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await createEvent(token, form);
      setForm({ title: '', startTime: '', endTime: '', status: 'BUSY' });
      await load();
    } catch (err) {
      setErr(err.error || 'Failed to create');
    }
  }

  async function toggleSwappable(ev) {
    const newStatus = ev.status === 'SWAPPABLE' ? 'BUSY' : 'SWAPPABLE';
    try {
      await updateEvent(token, ev.id, { status: newStatus });
      await load();
    } catch (err) {
      setErr(err.error || 'Failed to update');
    }
  }

  return (
    <div>
      <h2>Dashboard</h2>
      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ flex: 1 }}>
          <h3>Create Event</h3>
          <form onSubmit={handleCreate}>
            <div><input value={form.title} onChange={e=>setForm({...form, title: e.target.value})} placeholder="Title" /></div>
            <div><input value={form.startTime} onChange={e=>setForm({...form, startTime: e.target.value})} placeholder="Start ISO (e.g., 2025-11-10T10:00:00Z)" /></div>
            <div><input value={form.endTime} onChange={e=>setForm({...form, endTime: e.target.value})} placeholder="End ISO" /></div>
            <div style={{ marginTop: 8 }}><button type="submit">Create</button></div>
          </form>
        </div>

        <div style={{ flex: 2 }}>
          <h3>My Events</h3>
          {err && <div style={{ color: 'red' }}>{err}</div>}
          {events.length === 0 && <div>No events yet</div>}
          <div style={{ display: 'grid', gap: 8 }}>
            {events.map(ev => (
              <EventCard key={ev.id} ev={ev}>
                <button onClick={()=>toggleSwappable(ev)}>{ev.status === 'SWAPPABLE' ? 'Unmark Swappable' : 'Mark Swappable'}</button>
              </EventCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
