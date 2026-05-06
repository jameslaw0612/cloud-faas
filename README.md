# Cloud FaaS Demo

A small Function-as-a-Service project built with FastAPI and Docker. It can execute Python, Node.js, and Go code inside short-lived containers, then return the output to the user.

## Features

- FastAPI backend for function execution
- Separate Docker runtime images per language
- File upload support using `multipart/form-data`
- Inline code execution using JSON
- Browser UI for running functions
- Execution history log for recent runs
- Memory, CPU, and timeout limits for each container

## Project Structure

```text
Cloud-faas/
|-- main.py
|-- runner.py
|-- requirements.txt
|-- README.md
|-- dockerfile
|-- build-runtime-images.ps1
|-- start-api.ps1
|-- web/
|   `-- index.html
`-- mnt/
    `-- user-data/
        `-- outputs/
            `-- faas/
                |-- dockerfile
                `-- runtimes/
                    |-- python/
                    |   `-- dockerfile
                    |-- node/
                    |   `-- dockerfile
                    `-- go/
                        `-- dockerfile
```

## Requirements

- Python 3.11+ installed
- Docker Desktop running
- PowerShell on Windows

## Setup

### 1. Create and activate the virtual environment

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 2. Install Python dependencies

```powershell
python -m pip install -r requirements.txt
```

### 3. Build the runtime Docker images

```powershell
.\build-runtime-images.ps1
```

### 4. Start the API

```powershell
.\start-api.ps1
```

Then open:

- `http://127.0.0.1:8000/` for the web UI
- `http://127.0.0.1:8000/docs` for Swagger UI
- `http://127.0.0.1:8000/api/status` for API status

## Optional: Run the API with Docker

Build the API container from the project root:

```powershell
docker build -f dockerfile -t cloud-faas-api .
docker run -p 8000:8000 cloud-faas-api
```

For class demos, the simpler setup is still to run the API on the host machine with `.\start-api.ps1`. If you containerize the API itself, that container also needs access to the host Docker engine so it can create the runtime containers.

## API Endpoints

### `GET /`

Serves the browser UI.

### `GET /api/status`

Returns the running status and supported languages.

### `GET /history`

Returns recent execution history.

Example:

```text
GET /history?limit=10
```

### `POST /run`

Runs inline code using JSON.

Example request:

```json
{
  "language": "python",
  "code": "print(\"Hello, world!\")"
}
```

### `POST /run/upload`

Runs an uploaded file using `multipart/form-data`.

Form fields:

- `language`
- `file`

## Sample Tests

### Python

```json
{
  "language": "python",
  "code": "for i in range(3):\n    print('item', i)"
}
```

### Node.js

```json
{
  "language": "node",
  "code": "console.log('Hello from Node')"
}
```

### Go

```json
{
  "language": "go",
  "code": "package main\n\nimport \"fmt\"\n\nfunc main() {\n    fmt.Println(\"Hello from Go\")\n}"
}
```

## Notes for Demo

- Each request creates a temporary container.
- The container is removed after execution.
- The service is stateless by default.
- Recent execution summaries are written to `data/executions.jsonl`.
- Uploaded files are validated against the selected language.

## Common Issues

### `uvicorn` is not recognized

Use:

```powershell
python -m uvicorn main:app --reload --port 8000
```

### Docker is unavailable

Start Docker Desktop first, then retry the request.

### Runtime image not found

Build the runtime images again:

```powershell
.\build-runtime-images.ps1
```

### Upload endpoint fails at startup

Install the new dependency:

```powershell
python -m pip install -r requirements.txt
```
