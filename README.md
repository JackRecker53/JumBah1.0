# JumBah

## Database setup

1. **Launch PostgreSQL** – start a PostgreSQL server before opening pgAdmin. You can run a container or a local service. Example with Docker:

   ```bash
   docker run --name jumbah-postgres \
     -e POSTGRES_USER=jumbah \
     -e POSTGRES_PASSWORD=pass \
     -e POSTGRES_DB=jumbah \
     -p 5432:5432 -d postgres
   ```

   Export a connection string that the backend will use:

   ```bash
   export DATABASE_URL="postgresql+psycopg2://jumbah:pass@localhost:5432/jumbah"
   ```

2. **Create the database and user** – in pgAdmin (after the server is running) create a connection with the above credentials and then create the `jumbah` database and user. The same can be done via SQL:

   ```sql
   CREATE DATABASE jumbah;
   CREATE USER jumbah WITH ENCRYPTED PASSWORD 'pass';
   GRANT ALL PRIVILEGES ON DATABASE jumbah TO jumbah;
   ```

   pgAdmin is optional and only needed for graphical administration; you can manage the database entirely with SQL.

3. **Run migrations** – before launching the FastAPI app, apply Alembic migrations:

   ```bash
   cd Backend
   alembic upgrade head
   ```

4. **Start FastAPI** – once the database is ready and migrations are applied, launch the application:

   ```bash
   uvicorn app:app --reload
   ```

