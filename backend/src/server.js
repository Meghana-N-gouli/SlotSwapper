const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const swapsRoutes = require('./routes/swaps');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api', swapsRoutes); // contains /swappable-slots, /swap-request, /swap-requests, /swap-response/:id

app.get('/', (req, res) => res.json({ ok: true, msg: 'SlotSwapper backend running' }));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
