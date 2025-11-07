SlotSwapper Frontend (Vite + React)

1. Install:
   npm install

2. Run dev server:
   npm run dev

3. Edit API base by setting VITE_API_BASE in environment or edit src/api.js.






SlotSwapper Backend
-------------------

1. Create a Postgres database. Example:
   createdb slotswapper
   or use Docker.

2. Copy .env.example to .env and set DATABASE_URL, JWT_SECRET, PORT.

3. Run migrations:
   npm run migrate

   or:
   psql $DATABASE_URL -f migrations/init.sql

4. Install dependencies:
   npm install

5. Start server:
   npm run dev
