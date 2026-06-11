# Converti

Converti is split into two apps:

- `frontend/` - React + Vite + TypeScript user interface.
- `backend/` - FastAPI conversion API.

The production shape is a single domain: the frontend is served from `/`, and `/api/*` is proxied to the backend service.

## Local Development

Start the backend API:

```powershell
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 7860
```

Start the frontend:

```powershell
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api` to `http://127.0.0.1:7860`.

## Tests And Builds

Backend:

```powershell
cd backend
pytest
```

Frontend:

```powershell
cd frontend
npm run build
```

## API Endpoints

- `POST /api/convert`
- `POST /api/convert-document`
- `POST /api/convert-image`
- `GET /api/document-conversions`
- `GET /api/image-conversions`
- `GET /api/pdf-conversions`
- `GET /api/presentation-conversions`
- `POST /api/convert-pdf`
- `POST /api/convert-presentation`
- `POST /api/merge-pdfs`
- `POST /api/convert-pptx-images`
- `GET /health`
