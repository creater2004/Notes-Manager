# Notes Manager API

Simple Express and MongoDB Atlas backend for the Notes Manager frontend.

## Setup

1. Copy `.env.example` to `.env`.
2. Set `MONGO_URI` to your MongoDB Atlas connection string and `JWT_SECRET` to a private random value. Set `CLIENT_URL` if your frontend is not at `http://localhost:5173`.
3. Install dependencies and start the API:

   ```sh
   npm install
   npm run dev
   ```

The backend entrypoint is `server.js`; the Express app, database connection, models, authentication middleware, and API routes are separated into `app.js` and `src/`. It listens on `http://localhost:5000` by default. Use `npm start` to run without watch mode.

## Endpoints

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/health` | No | API health check |
| POST | `/api/auth/register` | No | Create an account and return a token |
| POST | `/api/auth/login` | No | Sign in and return a token |
| GET | `/api/notes` | Bearer token | List the signed-in user's notes |
| POST | `/api/notes` | Bearer token | Create a note |
| PUT | `/api/notes/:id` | Bearer token | Update a note |
| DELETE | `/api/notes/:id` | Bearer token | Delete a note |

Notes support `Study`, `Personal`, `Work`, and `Other`. Every note operation is scoped to the logged-in user.
