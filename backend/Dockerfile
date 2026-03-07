# Backend Dockerfile
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Copy project files
COPY pyproject.toml README.md ./
COPY . .

# Install Python dependencies
RUN pip install --no-cache-dir -e .

# Expose port (adjust if your backend uses a different port)
EXPOSE 8000

# Default command - adjust as needed for your server
CMD ["python", "main.py"]
