#!/bin/bash
# Bash script to start PostgreSQL database in Docker
# Usage: ./start-db.sh

echo "Starting PostgreSQL database container..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Warning: .env file not found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "Please edit .env file with your configuration before continuing."
    else
        echo "Error: .env.example not found. Please create .env file manually."
        exit 1
    fi
fi

# Start Docker Compose
docker-compose up -d

if [ $? -eq 0 ]; then
    echo "Database container started successfully!"
    echo "Waiting for database to be ready..."
    
    # Wait for health check
    max_attempts=30
    attempt=0
    ready=false
    
    while [ $attempt -lt $max_attempts ] && [ "$ready" = false ]; do
        sleep 2
        health=$(docker inspect --format='{{.State.Health.Status}}' fitness_gym_postgres 2>/dev/null)
        if [ "$health" = "healthy" ]; then
            ready=true
            echo "Database is ready!"
        else
            attempt=$((attempt + 1))
            echo "Waiting... ($attempt/$max_attempts)"
        fi
    done
    
    if [ "$ready" = true ]; then
        echo ""
        echo "Database connection info:"
        echo "  Host: localhost"
        echo "  Port: 5432"
        echo "  Database: fitness_gym"
        echo "  User: postgres"
        echo ""
        echo "To view logs: docker-compose logs -f postgres"
        echo "To stop: docker-compose down"
    else
        echo "Warning: Database may not be fully ready. Check logs with: docker-compose logs postgres"
    fi
else
    echo "Failed to start database container. Check Docker is running."
    exit 1
fi

