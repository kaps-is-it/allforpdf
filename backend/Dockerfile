FROM python:3.11-slim

# Install system dependencies for document conversion and browser rendering.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libreoffice \
    fonts-liberation \
    fonts-dejavu \
    && rm -rf /var/lib/apt/lists/* \
    && useradd -m -u 1000 user

ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    PYTHONUNBUFFERED=1 \
    CONVERTI_TEMP_DIR=/home/user/app/temp_conversions \
    PLAYWRIGHT_BROWSERS_PATH=/home/user/.cache/ms-playwright

WORKDIR $HOME/app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright OS dependencies as root, then provision Chromium in the
# runtime user's browser cache for notebook, SVG, HTML, and PDF rendering.
RUN python -m playwright install-deps chromium

USER user
RUN python -m playwright install chromium

COPY --chown=user . .

RUN mkdir -p temp_conversions

EXPOSE 7860

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
