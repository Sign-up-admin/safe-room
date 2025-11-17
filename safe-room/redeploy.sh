#!/bin/bash
# Docker redeployment script
# Used to quickly redeploy the fitness gym management system

echo "========================================"
echo "  Fitness Gym Management System"
echo "  Docker Redeployment Script"
echo "========================================"
echo ""

# Check if Docker is running
echo "[1/5] Checking Docker status..."
if ! docker ps > /dev/null 2>&1; then
    echo "✗ Docker is not running, please start Docker first"
    exit 1
fi
echo "✓ Docker is running"

# Stop existing containers
echo ""
echo "[2/5] Stopping existing containers..."
docker-compose down
echo "✓ Containers stopped"

# Ask whether to clean volumes
echo ""
read -p "Clean data volumes? This will delete all data (y/N): " cleanVolumes
if [[ $cleanVolumes == "y" || $cleanVolumes == "Y" ]]; then
    echo "Cleaning data volumes..."
    docker-compose down -v
    echo "✓ Data volumes cleaned"
fi

# Ask whether to rebuild
echo ""
read -p "Rebuild images? (Y/n): " rebuild
if [[ $rebuild != "n" && $rebuild != "N" ]]; then
    # Ask whether to use cache (default use cache to speed up build)
    echo ""
    read -p "Force rebuild (no cache)? (y/N): " noCache
    BUILD_ARGS=("build")
    if [[ $noCache == "y" || $noCache == "Y" ]]; then
        BUILD_ARGS+=("--no-cache")
        echo "[3/5] Rebuilding images (no cache)..."
    else
        echo "[3/5] Rebuilding images (using cache to speed up)..."
        echo "Tip: BuildKit enabled, Maven dependencies will use cache"
    fi
    
    # Enable BuildKit to support cache mount functionality
    export DOCKER_BUILDKIT=1
    export COMPOSE_DOCKER_CLI_BUILD=1
    
    docker-compose "${BUILD_ARGS[@]}"
    if [ $? -ne 0 ]; then
        echo "✗ Image build failed"
        exit 1
    fi
    echo "✓ Image build completed"
else
    echo "[3/5] Skipping image build"
fi

# Start services
echo ""
echo "[4/5] Starting services..."
docker-compose up -d
if [ $? -ne 0 ]; then
    echo "✗ Service startup failed"
    exit 1
fi
echo "✓ Services started"

# Wait for services to be ready
echo ""
echo "[5/5] Waiting for services to be ready..."
sleep 10

# Check service status
echo ""
echo "========================================"
echo "  Deployment completed!"
echo "========================================"
echo ""
echo "Service status:"
docker-compose ps
echo ""
echo "View logs: docker-compose logs -f"
echo "Stop services: docker-compose down"
echo ""
echo "Access URLs:"
echo "  Backend API: http://localhost:8080/springboot1ngh61a2"
echo "  Frontend App: http://localhost:8080/springboot1ngh61a2/front/front/index.html"
echo "  Admin Panel: http://localhost:8080/springboot1ngh61a2/admin/admin/index.html"
echo ""
