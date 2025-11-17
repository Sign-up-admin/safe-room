#!/bin/bash
# Docker build script - Quick build backend image
# Maven dependencies will be cached and not deleted, making subsequent builds faster

set -e

TAG="latest"
NO_CACHE=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --no-cache)
            NO_CACHE="--no-cache"
            shift
            ;;
        --tag)
            TAG="$2"
            shift 2
            ;;
        *)
            echo "Usage: $0 [--no-cache] [--tag TAG]"
            exit 1
            ;;
    esac
done

# Enable BuildKit (required for Maven dependency caching)
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

echo "Building backend Docker image..."
if [ -n "$NO_CACHE" ]; then
    echo "Using --no-cache option"
else
    echo "✓ Maven dependencies will be kept in cache"
fi

BUILD_ARGS=(
    "build"
    "-f" "springboot1ngh61a2/Dockerfile"
    "-t" "fitness_gym_backend:$TAG"
    "springboot1ngh61a2"
)

[ -n "$NO_CACHE" ] && BUILD_ARGS+=("$NO_CACHE")

docker "${BUILD_ARGS[@]}"

if [ $? -eq 0 ]; then
    echo "✓ Build successful: fitness_gym_backend:$TAG"
    echo "Run: docker-compose up -d"
else
    echo "✗ Build failed"
    exit 1
fi
