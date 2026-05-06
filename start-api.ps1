$ErrorActionPreference = "Stop"

if (-not (Test-Path .venv\Scripts\python.exe)) {
    throw "Virtual environment not found. Create it first with: python -m venv .venv"
}

.\.venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
