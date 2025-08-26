Main JumBah

## Backend Setup

The backend is built with **FastAPI** and uses **PostgreSQL** (or SQLite for development) to
store user accounts and game scores. The database connection is configured via the
`DATABASE_URL` environment variable. If not provided, a local SQLite database in
`Backend/instance/jumbah.db` is used.

### Quick Start

1. Create and activate a Python virtual environment.
2. Install backend dependencies:

   ```bash
   pip install -r Backend/requirements.txt
   ```

3. Set the database URL (example for PostgreSQL):

   ```bash
   export DATABASE_URL=postgresql://user:password@localhost:5432/jumbah
   ```

4. Run the API:

   ```bash
   uvicorn Backend.app:app --reload
   ```

### Game Endpoints

- `POST /scores` – submit a score for the authenticated user.
- `GET /leaderboard` – view the top scores.

These endpoints allow you to build an interactive points-based game on top of the
travel chatbot.
