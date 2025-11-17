# Docker build script - Quick build backend image
# Maven dependencies will be cached and not deleted, making subsequent builds faster

param(
    [switch]$NoCache,
    [string]$Tag = "latest"
)

# Enable BuildKit (required for Maven dependency caching)
$env:DOCKER_BUILDKIT = "1"
$env:COMPOSE_DOCKER_CLI_BUILD = "1"

Write-Host "Building backend Docker image..." -ForegroundColor Cyan
if ($NoCache) {
    Write-Host "Using --no-cache option" -ForegroundColor Yellow
} else {
    Write-Host "✓ Maven dependencies will be kept in cache" -ForegroundColor Green
}

$buildArgs = @(
    "build",
    "-f", "springboot1ngh61a2/Dockerfile",
    "-t", "fitness_gym_backend:$Tag",
    "springboot1ngh61a2"
)

if ($NoCache) {
    $buildArgs += "--no-cache"
}

docker @buildArgs

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Build successful: fitness_gym_backend:$Tag" -ForegroundColor Green
    Write-Host "Run: docker-compose up -d" -ForegroundColor Cyan
} else {
    Write-Host "✗ Build failed" -ForegroundColor Red
    exit 1
}
