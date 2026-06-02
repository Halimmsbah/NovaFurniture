# Nova Luxury Furnishings

Project folders are organized as a frontend/backend workspace.

## Structure

- `frontend/` — React + TanStack Start + Vite app.
- `backend/` — Express + MongoDB API service.

## Install dependencies

From the project root:

- `npm install`

## Run the frontend

From the project root:

- `npm run dev`

Or from the frontend folder:

- `cd frontend`
- `npm install`
- `npm run dev`

## Run the backend

From the project root:

- `npm run backend:dev`

Or from the backend folder:

- `cd backend`
- `npm install`
- `npm run dev`

The backend runs on `http://localhost:3000` by default.

## API configuration

The frontend reads `VITE_API_BASE_URL` from `frontend/.env` and defaults to `http://localhost:3000/api/v1`.

That matches the backend routes under `backend/src/modules/index.routes.js`, which are mounted at `/api/v1/*`.

## Deployment

Complete deployment instructions are available in [DEPLOYMENT.md](./DEPLOYMENT.md).

### Quick Deployment Summary:

- **Frontend**: Deploy on [Vercel](https://vercel.com) (auto-deploy from GitHub)
- **Backend**: Deploy on [Render.com](https://render.com) (auto-deploy from GitHub)
- **Database**: Use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier available)

After deploying both, connect them by updating environment variables to point to each other's URLs.
