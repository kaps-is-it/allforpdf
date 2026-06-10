---
title: AllForPDF API
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
---

# AllForPDF API

FastAPI backend for AllForPDF file conversions.

## Runtime

- `GET /health`
- `POST /api/convert`
- `POST /api/convert-document`
- `POST /api/convert-image`
- `POST /api/convert-pdf`
- `POST /api/merge-pdfs`
- `POST /api/convert-pptx-images`

Set these Space variables after deployment:

- `CONVERTI_ENV=production`
- `CONVERTI_CORS_ORIGINS=https://allforpdf.com,https://www.allforpdf.com`
