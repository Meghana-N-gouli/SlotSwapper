import React from 'react';

export default function EventCard({ ev, children }) {
  return (
    <div style={{ border: '1px solid #ddd', padding: 8, borderRadius: 6 }}>
      <div style={{ fontWeight: 600 }}>{ev.title}</div>
      <div style={{ fontSize: 13 }}>{ev.startTime} → {ev.endTime}</div>
      <div style={{ fontSize: 12, marginTop: 4 }}>Status: <strong>{ev.status || 'UNKNOWN'}</strong></div>
      <div style={{ marginTop: 8 }}>{children}</div>
    </div>
  );
}
