# AI Interview Platform

Developer workflow scripts and quick start

Run once to install dependencies:

```bash
npm run install-all
```

Start backend and frontend concurrently in development:

```bash
npm run dev
```

Start backend (production-like) + frontend dev:

```bash
npm start
```

Notes:
- Backend runs on port 5000 by default (http://localhost:5000)
- Frontend Vite dev server runs on 5173 (or next available port)
- Students API endpoints: /api/students
- Database files created under /database: students.db and students.json

To run only frontend or backend use the subpackage scripts:
- cd backend && npm run dev
- cd frontend && npm run dev
