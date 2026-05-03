# Shalini Portfolio

Personal portfolio website with a static frontend served by an Express backend.

## Run Locally

```bash
cd backend
npm install
npm start
```

Open `http://localhost:3000`.

Create `backend/.env` with your MongoDB connection string if you want the contact form and dynamic project storage. You can copy `.env.example` as a starting point:

```env
MONGO_URI=your_mongodb_connection_string
ADMIN_TOKEN=use_a_long_random_secret
ALLOWED_ORIGINS=http://localhost:3000
```

## Deploy On Render

1. Push this repository to GitHub.
2. In Render, create a new **Blueprint** and select this repo. Render will use `render.yaml`.
3. Add the `MONGO_URI` environment variable when Render asks for it.
4. Keep the generated `ADMIN_TOKEN` value. It protects the project-create API route.
5. After the first deploy, set `ALLOWED_ORIGINS` to your Render URL, for example `https://shalini-portfolio.onrender.com`. Do not include a path after the domain.
6. Deploy the service.

The app serves the frontend from the backend, so you only need one Render web service.
