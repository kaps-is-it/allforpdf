FROM python:3.11-slim

# Install system dependencies: LibreOffice for documents and Fonts
RUN apt-get update && apt-get install -y --no-install-recommends \
    libreoffice \
    fonts-liberation \
    fonts-dejavu \
    && rm -rf /var/lib/apt/lists/*



WORKDIR /app

# Install pip dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Provision playwright browser globally inside container for Jupyter notebook rendering
RUN playwright install chromium --with-deps

# Copy application files
COPY . .

# Ensure temp directory exists and has write permissions
RUN mkdir -p temp_conversions && chmod 777 temp_conversions

# Expose port (7860 is the default requirement for Free HuggingFace Spaces)
EXPOSE 7860

# Start API server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
