$ErrorActionPreference = "Stop"

docker build -f mnt/user-data/outputs/faas/runtimes/python/dockerfile -t faas-python-runtime mnt/user-data/outputs/faas/runtimes/python
docker build -f mnt/user-data/outputs/faas/runtimes/node/dockerfile -t faas-node-runtime mnt/user-data/outputs/faas/runtimes/node
docker build -f mnt/user-data/outputs/faas/runtimes/go/dockerfile -t faas-go-runtime mnt/user-data/outputs/faas/runtimes/go

Write-Host "Runtime images built successfully." -ForegroundColor Green
