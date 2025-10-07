FROM python:3.11-slim-bullseye

WORKDIR /app

# Install system dependencies including ffmpeg for audio processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    build-essential \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port (Railway will set this dynamically)
EXPOSE $PORT

# Create entrypoint script to handle PORT variable
RUN echo '#!/bin/bash\nPORT=${PORT:-8080}\nexec gunicorn --bind 0.0.0.0:$PORT --timeout 300 --workers 1 app:app' > /app/start.sh
RUN chmod +x /app/start.sh

# Run the application
CMD ["/app/start.sh"]
