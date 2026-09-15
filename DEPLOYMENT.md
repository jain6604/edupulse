# EduPulse production deployment

## Current architecture

- **Frontend:** Vercel, serving the React production build.
- **Backend:** Render web service, serving FastAPI from `backend/`.
- **Database:** managed PostgreSQL, supplied through `DATABASE_URL`.

## Render deployment

`render.yaml` is the source of truth for the backend service: it installs `backend/requirements.txt`, starts `uvicorn main:app --host 0.0.0.0 --port $PORT`, checks `/` for health, and redeploys on Git commits.

In the Render dashboard, set these service environment variables:

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection URL. |
| `GEMINI_API_KEY` | For chat | The API starts without it; only the AI chat endpoint returns a clear 503 setup response. |
| `SECRET_KEY` | Yes | Use a long random value; Render can generate one from the blueprint. |

## Vercel deployment

Keep `REACT_APP_API_URL` set to the deployed Render backend URL in Vercel project settings, then redeploy the frontend. The frontend currently targets `https://edupulse-backend-k66t.onrender.com` outside localhost.

## Production checks

1. Visit `https://<render-service>/` and confirm `{"message":"EduPulse API is running"}`.
2. Open `https://edupulse-sandy-nu.vercel.app`.
3. Log in, open the dashboard, and confirm API-backed metrics load.
4. Send one AI-chat message; if Gemini is not configured, the UI should show an availability message rather than crashing the backend.
