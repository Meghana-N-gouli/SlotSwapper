const db = require('../db');


async function getSwappableSlots(req, res) {
  try {
    const q = await db.query(
      `SELECT e.id, e.title, e.start_time, e.end_time, e.owner_id
       FROM events e
       WHERE e.status = 'SWAPPABLE' AND e.owner_id <> $1
       ORDER BY e.start_time`,
      [req.user.id]
    );
    const formatted = q.rows.map(r => ({
      id: r.id,
      title: r.title,
      startTime: r.start_time,
      endTime: r.end_time,
      ownerId: r.owner_id
    }));
    return res.json(formatted);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}


async function createSwapRequest(req, res) {
  const { mySlotId, theirSlotId } = req.body;
  if (!mySlotId || !theirSlotId) return res.status(400).json({ error: 'mySlotId and theirSlotId required' });

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const myRes = await client.query('SELECT * FROM events WHERE id=$1 FOR UPDATE', [mySlotId]);
    const theirRes = await client.query('SELECT * FROM events WHERE id=$1 FOR UPDATE', [theirSlotId]);

    if (myRes.rowCount === 0 || theirRes.rowCount === 0) {
      throw new Error('One or both slots not found');
    }
    const myEvent = myRes.rows[0];
    const theirEvent = theirRes.rows[0];

    if (String(myEvent.owner_id) !== String(req.user.id)) throw new Error('You do not own mySlotId');
    if (myEvent.status !== 'SWAPPABLE' || theirEvent.status !== 'SWAPPABLE') throw new Error('Both slots must be SWAPPABLE');

    const insert = await client.query(
      `INSERT INTO swap_requests (requester_id, responder_id, my_event_id, their_event_id, status)
       VALUES ($1,$2,$3,$4,'PENDING') RETURNING *`,
      [req.user.id, theirEvent.owner_id, mySlotId, theirSlotId]
    );

    await client.query('UPDATE events SET status=$1 WHERE id=$2', ['SWAP_PENDING', mySlotId]);
    await client.query('UPDATE events SET status=$1 WHERE id=$2', ['SWAP_PENDING', theirSlotId]);

    await client.query('COMMIT');
 // return created swap request
    return res.json(insert.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('createSwapRequest error', err.message || err);
    return res.status(400).json({ error: err.message || 'Failed to create swap request' });
  } finally {
    client.release();
  }
}

async function listSwapRequests(req, res) {
  try {
    const q = await db.query(
      `SELECT sr.*, 
             r.name as requester_name, s.name as responder_name
       FROM swap_requests sr
       LEFT JOIN users r ON r.id = sr.requester_id
       LEFT JOIN users s ON s.id = sr.responder_id
       WHERE sr.requester_id = $1 OR sr.responder_id = $1
       ORDER BY sr.created_at DESC`,
      [req.user.id]
    );
    return res.json(q.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}


async function respondToSwapRequest(req, res) {
  const requestId = req.params.requestId;
  const { accept } = req.body;
  if (typeof accept !== 'boolean') return res.status(400).json({ error: 'accept: boolean required' });

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const srRes = await client.query('SELECT * FROM swap_requests WHERE id=$1 FOR UPDATE', [requestId]);
    if (srRes.rowCount === 0) throw new Error('Swap request not found');
    const swap = srRes.rows[0];

    if (String(swap.responder_id) !== String(req.user.id)) throw new Error('Only responder can accept/reject');
    if (swap.status !== 'PENDING') throw new Error('Swap request not pending');

    
    const myEvRes = await client.query('SELECT * FROM events WHERE id=$1 FOR UPDATE', [swap.my_event_id]);
    const theirEvRes = await client.query('SELECT * FROM events WHERE id=$1 FOR UPDATE', [swap.their_event_id]);

    if (myEvRes.rowCount === 0 || theirEvRes.rowCount === 0) {
      throw new Error('Referenced event(s) not found');
    }
    const evA = myEvRes.rows[0]; // my_event (offered by requester)
    const evB = theirEvRes.rows[0]; // their_event (owned by responder)

    if (!accept) {
     
      await client.query('UPDATE events SET status=$1 WHERE id IN ($2,$3)', ['SWAPPABLE', swap.my_event_id, swap.their_event_id]).catch(async () => {
        // pg doesn't support IN with param placeholders like that; do two updates
        await client.query('UPDATE events SET status=$1 WHERE id=$2', ['SWAPPABLE', swap.my_event_id]);
        await client.query('UPDATE events SET status=$1 WHERE id=$2', ['SWAPPABLE', swap.their_event_id]);
      });
      await client.query('UPDATE swap_requests SET status=$1, updated_at=now() WHERE id=$2', ['REJECTED', requestId]);
      await client.query('COMMIT');
      return res.json({ status: 'REJECTED' });
    }

    // Accept flow - validate statuses
    if (evA.status !== 'SWAP_PENDING' || evB.status !== 'SWAP_PENDING') throw new Error('Events are not pending swap');

    // swap owners
    const ownerA = evA.owner_id; // requester
    const ownerB = evB.owner_id; // responder

    // update events owner and statuses
    await client.query('UPDATE events SET owner_id=$1, status=$2, updated_at=now() WHERE id=$3', [ownerB, 'BUSY', evA.id]);
    await client.query('UPDATE events SET owner_id=$1, status=$2, updated_at=now() WHERE id=$3', [ownerA, 'BUSY', evB.id]);

    await client.query('UPDATE swap_requests SET status=$1, updated_at=now() WHERE id=$2', ['ACCEPTED', requestId]);

    await client.query('COMMIT');

    return res.json({ status: 'ACCEPTED' });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('respondToSwapRequest error', err.message || err);
    return res.status(400).json({ error: err.message || 'Failed to respond to request' });
  } finally {
    client.release();
  }
}

module.exports = { getSwappableSlots, createSwapRequest, listSwapRequests, respondToSwapRequest };
