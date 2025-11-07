const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// helpers
function mapEventRow(row) {
  return {
    id: row.id,
    ownerId: row.owner_id,
    title: row.title,
    startTime: row.start_time,
    endTime: row.end_time,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function getMyEvents(req, res) {
  try {
    const q = await db.query('SELECT * FROM events WHERE owner_id=$1 ORDER BY start_time', [req.user.id]);
    return res.json(q.rows.map(mapEventRow));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function createEvent(req, res) {
  const { title, startTime, endTime, status } = req.body;
  if (!title || !startTime || !endTime) return res.status(400).json({ error: 'title, startTime, endTime required' });
  const s = status || 'BUSY';
  try {
    const insert = await db.query(
      `INSERT INTO events (owner_id, title, start_time, end_time, status)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [req.user.id, title, startTime, endTime, s]
    );
    return res.json(mapEventRow(insert.rows[0]));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function updateEvent(req, res) {
  const id = req.params.id;
  const { title, startTime, endTime, status } = req.body;
  try {
    // ensure owner
    const evQ = await db.query('SELECT * FROM events WHERE id=$1', [id]);
    if (evQ.rowCount === 0) return res.status(404).json({ error: 'Event not found' });
    const ev = evQ.rows[0];
    if (ev.owner_id !== req.user.id) return res.status(403).json({ error: 'Not the owner' });

    const upd = await db.query(
      `UPDATE events SET title=$1, start_time=$2, end_time=$3, status=$4, updated_at=now()
       WHERE id=$5 RETURNING *`,
      [title || ev.title, startTime || ev.start_time, endTime || ev.end_time, status || ev.status, id]
    );
    return res.json(mapEventRow(upd.rows[0]));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function deleteEvent(req, res) {
  const id = req.params.id;
  try {
    // ensure owner
    const evQ = await db.query('SELECT * FROM events WHERE id=$1', [id]);
    if (evQ.rowCount === 0) return res.status(404).json({ error: 'Event not found' });
    const ev = evQ.rows[0];
    if (ev.owner_id !== req.user.id) return res.status(403).json({ error: 'Not the owner' });
    await db.query('DELETE FROM events WHERE id=$1', [id]);
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { getMyEvents, createEvent, updateEvent, deleteEvent };
