# QuizFlow

A full MERN quiz platform: teachers schedule quizzes, students take them under a server-enforced
deadline, and everything is graded automatically.

## Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth, bcrypt password hashing
- **Frontend:** React (Vite), React Router, Recharts, lucide-react icons

## Project layout

```
quizflow/
  backend/    Express API (auth, quizzes, attempts)
  frontend/   React + Vite app
```

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/quizflow   # or an Atlas connection string
JWT_SECRET=replace-with-a-long-random-string
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
```

You need a running MongoDB instance (local `mongod`, Docker, or a free MongoDB Atlas cluster).

```bash
npm run dev      # starts on http://localhost:5000, auto-restarts on change
# or: npm start
```

Health check: `GET http://localhost:5000/api/health` → `{ "status": "ok" }`

## 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL=/api (default is fine with the dev proxy)
npm run dev             # starts on http://localhost:5173
```

The Vite dev server proxies `/api/*` to `http://localhost:5000`, so both servers just need to be
running side by side — no CORS config needed in development.

## 3. Try it out

1. Open `http://localhost:5173`, register as a **teacher**, and create a quiz. Set the start
   time to right now (or a couple of minutes out) so it goes live immediately.
2. Open a second browser (or incognito window), register as a **student** in the matching stream
   (or create the quiz with stream "All streams"), and take the quiz from the dashboard.
3. Back in the teacher tab, open the quiz's attempts page to see the results table, class
   average, and score chart.

## How the important rules are enforced

- **One attempt per quiz:** `Attempt` has a unique compound index on `{ quiz, student }`
  (`backend/models/Attempt.js`). Starting a quiz creates that row immediately, so even a
  double-click or race condition can't create two attempts — MongoDB rejects the duplicate.
- **Server-side timing:** `POST /api/attempts/start` records `startedAt` on the server and
  returns a `deadline` computed as `min(quiz.endTime, startedAt + duration)`. The countdown you
  see in the UI is just a display — `POST /api/attempts/:id/submit` re-derives the same deadline
  server-side and caps `submittedAt` at that point, so a student can't extend their time by
  editing client-side state or pausing their laptop clock.
- **Server-side grading:** `gradeAnswers()` in `backend/controllers/attemptController.js` is the
  only place scores are computed, using the quiz's stored `correctOption` values, which the
  student-facing endpoints never return before submission.
- **Auth & roles:** JWTs carry a `role` claim; `middleware/auth.js` verifies the token and
  `authorize('teacher' | 'student')` gates each route.

## Notes / assumptions made while building this

- Teacher login uses **email** as the identifier (the original spec listed name/subject/password
  for registration, but a login needs something unique — email was the natural choice; swap it
  for a username field if you'd rather not collect email addresses).
- A quiz's `stream` can also be set to `ALL` so a teacher can publish one quiz open to every
  stream, in addition to the five listed (CSE / IT / ECE / AI / EE).
- The results table is sorted by percentage in **increasing order**, exactly as originally
  specified — note that this means the top scorer appears at the bottom of the table. Each row
  still carries a `rank` field computed independently (1 = highest score), in case you want to
  re-sort the table by rank instead later.
- If a submission request arrives after the deadline (e.g. a slow network), the server clamps
  `submittedAt` to the deadline rather than rejecting the request outright, so a student isn't
  penalized for a few seconds of lag — but their recorded time-taken and grading still reflect
  the enforced cutoff.

## Extending it

Natural next additions: CSV export of results, quiz editing/deletion, question banks reusable
across quizzes, email notifications when a quiz opens, and pagination for teachers with many
quizzes. Ask and I can build any of these into the current codebase.
