$ErrorActionPreference = "Stop"

docker build -f mnt/user-data/outputs/faas/runtimes/python/dockerfile -t faas-python-runtime mnt/user-data/outputs/faas/runtimes/python
docker build -f mnt/user-data/outputs/faas/runtimes/node/dockerfile -t faas-node-runtime mnt/user-data/outputs/faas/runtimes/node
docker build -f mnt/user-data/outputs/faas/runtimes/c/dockerfile -t faas-c-runtime mnt/user-data/outputs/faas/runtimes/c
docker build -f mnt/user-data/outputs/faas/runtimes/cpp/dockerfile -t faas-cpp-runtime mnt/user-data/outputs/faas/runtimes/cpp
docker build -f mnt/user-data/outputs/faas/runtimes/java/dockerfile -t faas-java-runtime mnt/user-data/outputs/faas/runtimes/java
docker build -f mnt/user-data/outputs/faas/runtimes/php/dockerfile -t faas-php-runtime mnt/user-data/outputs/faas/runtimes/php

Write-Host "Runtime images built successfully." -ForegroundColor Green
