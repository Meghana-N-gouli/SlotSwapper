# 🕒 SlotSwapper

**SlotSwapper** is a peer-to-peer time-slot scheduling web application that allows users to mark calendar events as *swappable*, browse other users’ available slots, and exchange time slots seamlessly — saving time, improving flexibility, and making scheduling more dynamic.

---

## 🚀 Overview

### 🌟 Concept
Users have personal calendars with busy time slots. Some slots can be marked as **SWAPPABLE**, meaning the user is willing to exchange that time with someone else.

**Example Flow:**
- User A marks a “Team Meeting” on Tuesday 10–11 AM as swappable.  
- User B marks a “Focus Block” on Wednesday 2–3 PM as swappable.  
- User A sees B’s slot and sends a swap request offering their Tuesday slot.  
- User B accepts → both slots are swapped between calendars.  

This allows flexible scheduling without manually coordinating times.

---

## 🧩 Design Overview

- **Frontend:** React (Vite) — clean UI for dashboard, marketplace, and requests.
- **Backend:** Node.js + Express.js.
- **Database:** PostgreSQL.
- **Authentication:** JWT (JSON Web Tokens).
- **Architecture:** RESTful API with authentication middleware and DB transactions.

---

## ⚙️ Setup & Installation

Follow these steps to run SlotSwapper locally.

### 1️⃣ Clone Repository
```bash
git clone https://github.com/<your-username>/SlotSwapper.git
cd SlotSwapper
Assumptions

Both slots must be SWAPPABLE before a swap can occur.

Each slot can only be involved in one swap request at a time.

Swaps are atomic and transactional to prevent partial updates.

JWT is required for all event and swap APIs.

Passwords are stored securely using hashing (bcrypt).

Challenges Faced & Solutions

Preventing race conditions during swaps	Used SQL transactions and row-level locks (SELECT ... FOR UPDATE)
Handling multiple simultaneous requests	Database-level checks and status validations
Ensuring swap integrity	Swapping owners within a single transaction
Managing authentication	Implemented JWT and middleware to secure protected routes
