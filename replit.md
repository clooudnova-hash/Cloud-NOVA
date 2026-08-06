# CloudNova — Cloud Mining Platform

## Overview
CloudNova is a full-stack cloud mining web app with a Node.js/Express backend and a pre-built React + Tailwind CSS frontend. The backend serves both the REST API and the static React build.

## Stack
- **Backend**: Node.js + Express + Socket.io + bcryptjs + jsonwebtoken
- **Frontend**: React 19 + React Router v7 + Tailwind CSS (pre-built in `FrontEnd/build`)
- **Data**: In-memory arrays (no database — data resets on server restart)
- **Real-time**: Socket.io for live chat relay

## Run Command
```
node Backend/index.js
```
The server starts on port 5000 (or `$PORT`) and serves the React frontend at `/`.

## Project Structure
```
Backend/
  index.js          — Express server, all API routes, Socket.io
  package.json      — Backend dependencies only
FrontEnd/
  src/              — React source files
  build/            — Pre-built production frontend (served by backend)
  package.json      — Frontend dependencies + build scripts
.env.example        — Environment variable reference
```

## Environment Variables
| Variable | Default | Description |
|---|---|---|
| `JWT_SECRET` | hardcoded fallback | Secret key for JWT tokens — change in production |
| `PORT` | `5000` | Server port |

Copy `.env.example` to `.env` and set `JWT_SECRET` before deploying to production.

## Admin Access
Default admin credentials (seeded on startup):
- Email: `noor@cloudnova.com`
- Password: `Admin@123`

Admin panel at `/admin`.

## Frontend Development
To make changes to the frontend:
```bash
cd FrontEnd
npm install
npm run build   # CI=false npm run build
```
The backend reads from `FrontEnd/build` automatically.

## Deploy (ZIP)
1. Run `npm install` in `Backend/`
2. Run `CI=false npm run build` in `FrontEnd/`
3. Set `JWT_SECRET` env variable
4. Run `node Backend/index.js`

## User Preferences
- Keep existing structure (Backend + FrontEnd folders)
- Do not add a database unless explicitly requested
- Fix issues without restructuring the stack
