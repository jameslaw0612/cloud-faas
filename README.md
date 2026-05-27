# Cloud FaaS Demo

A browser-based Function-as-a-Service demo built with FastAPI, Docker, and a plain HTML/CSS/JavaScript frontend. It lets you run small functions in isolated runtime containers, study language tutorials/examples, and return downloadable artifacts such as generated text files or transformed images.

## What This Project Does

Cloud FaaS accepts source code from the UI or API, copies that code into a short-lived Docker container, executes it with strict limits, captures the result, then removes the container after the run.

Supported languages:

- Python
- JavaScript
- C
- C++
- Java
- PHP

Main capabilities:

- Paste code or upload a source file
- Run interactive programs that wait for user input
- Switch between `Inline Result`, `JSON + Download Link`, and `Direct File Download`
- Upload an optional input asset file for the function to read
- Return downloadable artifacts such as images and text files
- Browse built-in Tutorials and Examples
- Save recent execution history

## How The FaaS Works

### Request flow

1. The user submits code from the web UI or an API endpoint.
2. `main.py` validates the request and passes it to `runner.py`.
3. `runner.py` chooses the correct runtime image for the selected language.
4. The function source code, plus any optional uploaded input file, is packed into a tar archive.
5. Docker creates a temporary container with memory, CPU, and timeout limits.
6. The code runs inside `/function` in that container.
7. The backend reads standard output, runtime errors, and optional generated artifacts.
8. The response is returned to the browser.
9. The container is removed.

### Output delivery modes

- `Inline Result`
  - Good for normal console output
  - Shows text in the `Execution result` box
  - If the function returns an artifact, the UI also shows a download card and image preview for images

- `JSON + Download Link`
  - The function can return a special JSON payload with a downloadable file
  - The UI shows output text plus a download link

- `Direct File Download`
  - The function response is streamed back as a downloadable file immediately
  - Useful for generated images, reports, or transformed files

### Artifact return patterns

The backend supports two artifact patterns:

- Base64 JSON payload
  - Your function prints JSON with a `faas_download` object
  - Example fields:
    - `filename`
    - `content_type`
    - `base64`
    - `output`

- Saved file in the workspace
  - Your function writes a file into `/function/faas_downloads`
  - The backend detects it and exposes it as a downloadable artifact

### Interactive mode

Some code needs follow-up input after execution starts.

Examples:

- `input()` in Python
- `Scanner` in Java
- `cin` in C++
- `scanf` in C
- `fgets(STDIN)` in PHP
- `readline` in JavaScript

For these cases, the frontend starts an interactive session through separate endpoints. The container stays alive briefly so the browser can send additional input lines and poll for new output.

## File And Folder Guide

### Root files

- [main.py](C:\Users\PC\Documents\Cloud\cloud-faas-main\main.py)
  - FastAPI app entry point
  - Defines HTTP routes
  - Serves the web UI and static files
  - Handles upload parsing, artifact download endpoints, and interactive endpoints

- [runner.py](C:\Users\PC\Documents\Cloud\cloud-faas-main\runner.py)
  - Core execution engine
  - Creates Docker containers
  - Archives code and optional input files into the container
  - Captures stdout/stderr
  - Stores execution history
  - Saves generated artifacts
  - Manages interactive sessions

- [requirements.txt](C:\Users\PC\Documents\Cloud\cloud-faas-main\requirements.txt)
  - Python dependencies for the API/backend

- [build-runtime-images.ps1](C:\Users\PC\Documents\Cloud\cloud-faas-main\build-runtime-images.ps1)
  - Builds all runtime Docker images used by the FaaS

- [start-api.ps1](C:\Users\PC\Documents\Cloud\cloud-faas-main\start-api.ps1)
  - Convenience script to start the API locally if you want to keep using the provided startup flow

- [dockerfile](C:\Users\PC\Documents\Cloud\cloud-faas-main\dockerfile)
  - Dockerfile for containerizing the API itself

- [README.md](C:\Users\PC\Documents\Cloud\cloud-faas-main\README.md)
  - Project documentation

### Frontend

- [web/index.html](C:\Users\PC\Documents\Cloud\cloud-faas-main\web\index.html)
  - Main HTML structure
  - Runner page, Tutorials page, Examples page, forms, cards, history, and download preview area

- [web/styles.css](C:\Users\PC\Documents\Cloud\cloud-faas-main\web\styles.css)
  - App styling
  - Color palette, layout, cards, buttons, tutorial/example presentation, responsive behavior

- [web/app.js](C:\Users\PC\Documents\Cloud\cloud-faas-main\web\app.js)
  - Frontend behavior
  - Handles form submission, delivery modes, interactive sessions, history rendering, tutorials/examples, downloads, and artifact previews

### Runtime images

- [mnt/user-data/outputs/faas/runtimes/python/dockerfile](C:\Users\PC\Documents\Cloud\cloud-faas-main\mnt\user-data\outputs\faas\runtimes\python\dockerfile)
  - Python runtime image
  - Includes Pillow so the grayscale image example can process uploaded images

- [mnt/user-data/outputs/faas/runtimes/node/dockerfile](C:\Users\PC\Documents\Cloud\cloud-faas-main\mnt\user-data\outputs\faas\runtimes\node\dockerfile)
  - JavaScript runtime image

- [mnt/user-data/outputs/faas/runtimes/c/dockerfile](C:\Users\PC\Documents\Cloud\cloud-faas-main\mnt\user-data\outputs\faas\runtimes\c\dockerfile)
  - C runtime image

- [mnt/user-data/outputs/faas/runtimes/cpp/dockerfile](C:\Users\PC\Documents\Cloud\cloud-faas-main\mnt\user-data\outputs\faas\runtimes\cpp\dockerfile)
  - C++ runtime image

- [mnt/user-data/outputs/faas/runtimes/java/dockerfile](C:\Users\PC\Documents\Cloud\cloud-faas-main\mnt\user-data\outputs\faas\runtimes\java\dockerfile)
  - Java runtime image

- [mnt/user-data/outputs/faas/runtimes/php/dockerfile](C:\Users\PC\Documents\Cloud\cloud-faas-main\mnt\user-data\outputs\faas\runtimes\php\dockerfile)
  - PHP runtime image

Notes:

- There is also a `go` runtime folder in the repo tree from an older version.
- The current app UI and backend use Python, JavaScript, C, C++, Java, and PHP.

### Data and sample content

- [examples](C:\Users\PC\Documents\Cloud\cloud-faas-main\examples)
  - Simple starter files per language

- [data/executions.jsonl](C:\Users\PC\Documents\Cloud\cloud-faas-main\data\executions.jsonl)
  - Recent execution history log

- [data/artifacts](C:\Users\PC\Documents\Cloud\cloud-faas-main\data\artifacts)
  - Saved downloadable artifacts returned by function runs

### Other folders

- [.venv](C:\Users\PC\Documents\Cloud\cloud-faas-main\.venv)
  - Local Python virtual environment

- [.vscode](C:\Users\PC\Documents\Cloud\cloud-faas-main\.vscode)
  - Editor settings

- [Cloud-FaaS-Backup](C:\Users\PC\Documents\Cloud\cloud-faas-main\Cloud-FaaS-Backup)
  - Backup copy created during development

## Setup Guide

### Requirements

- Windows with PowerShell
- Python 3.11 or newer
- Docker Desktop
- Enough permission to use Docker from your user account

### 1. Open the project folder

```powershell
cd "C:\Users\PC\Documents\Cloud\cloud-faas-main"
```

### 2. Create the virtual environment

```powershell
python -m venv .venv
```

### 3. Activate the virtual environment

```powershell
.\.venv\Scripts\Activate.ps1
```

### 4. Install backend dependencies

```powershell
python -m pip install -r requirements.txt
```

### 5. Start Docker Desktop

Make sure Docker Desktop is fully running before trying to build runtime images or execute code.

Quick test:

```powershell
docker version
```

If Docker says access is denied, your Windows user may need to be in the `docker-users` group.

### 6. Build the runtime images

```powershell
.\build-runtime-images.ps1
```

This is especially important after any runtime Dockerfile changes, such as the Python image update that installs Pillow.

### 7. Start the API

Option A, with your venv directly:

```powershell
.\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000
```

Option B, with the existing helper script:

```powershell
.\start-api.ps1
```

### 8. Open the app

- Web UI: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- Swagger docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Status endpoint: [http://127.0.0.1:8000/api/status](http://127.0.0.1:8000/api/status)

## How To Test The App

### Basic inline run

1. Open the web UI
2. Pick a language
3. Paste code
4. Leave `Output delivery` as `Inline Result`
5. Click `Run Function`

### Uploaded source file run

1. Switch to `Upload File`
2. Select a source file matching the chosen language
3. Run it

### Direct download run

1. Choose code that returns an artifact
2. Select `Direct File Download`
3. Run it
4. The browser should download the generated file immediately

### JSON + Download Link run

1. Choose code that returns a `faas_download` JSON payload
2. Select `JSON + Download Link`
3. Run it
4. The download card should appear with links and preview support for images

### Uploaded image grayscale example

1. Open `Examples`
2. Choose `Python`
3. Open `Turn an uploaded image into grayscale`
4. Click `Try this in Code Runner`
5. Upload an image with `Optional input file`
6. Choose either:
   - `JSON + Download Link`
   - `Direct File Download`
7. Click `Run Function`

Expected result:

- The image is converted to grayscale
- A file like `photo-grayscale.png` is returned
- If not using direct download, the UI shows a preview and download link

## API Overview

### UI and status

- `GET /`
  - Serves the app UI

- `GET /api/status`
  - Returns supported languages, limits, and artifact delivery capabilities

- `GET /history`
  - Returns recent execution history

### Standard execution

- `POST /run`
  - Run pasted code with JSON

- `POST /run/upload`
  - Run uploaded source code with multipart form data

### Execution with optional input file

- `POST /run/with-input`
  - Run pasted code plus an uploaded asset file such as an image

- `POST /run/upload`
  - Also supports an optional `input_file` alongside the uploaded source file

### Direct download execution

- `POST /run/download`
  - Run pasted code and stream the output as a file download

- `POST /run/upload/download`
  - Run uploaded source code and stream the result as a file download

- `POST /run/with-input/download`
  - Run pasted code with an uploaded asset and stream the result as a file download

### Artifact download

- `GET /artifacts/{artifact_id}`
  - Download a saved artifact from a previous run

### Interactive execution

- `POST /interactive/start`
- `POST /interactive/stop/{session_id}`
- `POST /interactive/input/{session_id}`
- `GET /interactive/output/{session_id}`

Compatibility aliases for older Python-only calls still exist:

- `POST /interactive/python/start`
- `POST /interactive/python/stop/{session_id}`
- `POST /interactive/python/input/{session_id}`
- `GET /interactive/python/output/{session_id}`

## Pasteable Example: Uploaded Image To Grayscale

Use this with:

- Language: `Python`
- Optional input file: upload an image
- Output delivery: `JSON + Download Link` or `Direct File Download`

```python
import base64
import io
import json
from pathlib import Path

from PIL import Image

supported_extensions = {".png", ".jpg", ".jpeg", ".bmp", ".gif", ".webp"}
current_dir = Path(".")

image_path = next(
    (
        path for path in current_dir.iterdir()
        if path.is_file()
        and path.suffix.lower() in supported_extensions
        and path.name != "handler.py"
    ),
    None,
)

if image_path is None:
    raise FileNotFoundError("Upload an image in the Optional input file field before running this code.")

with Image.open(image_path) as image:
    grayscale_image = image.convert("L")
    buffer = io.BytesIO()
    grayscale_image.save(buffer, format="PNG")

payload = {
    "faas_download": {
        "filename": f"{image_path.stem}-grayscale.png",
        "content_type": "image/png",
        "base64": base64.b64encode(buffer.getvalue()).decode("ascii"),
        "output": f"Prepared {image_path.stem}-grayscale.png",
    }
}

print(json.dumps(payload))
```

## Common Issues

### Docker is unavailable

Symptoms:

- `Docker is unavailable`
- `pipe/docker_engine` not found
- `permission denied while trying to connect to the docker API`

Fix:

1. Start Docker Desktop
2. Wait until Docker reports it is running
3. Run:

```powershell
docker version
```

If permission is denied, add your Windows user to `docker-users`, then sign out and sign back in.

### Runtime image not found

Rebuild the runtime images:

```powershell
.\build-runtime-images.ps1
```

### `uvicorn` not found

Use the virtual environment Python explicitly:

```powershell
.\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000
```

### Grayscale image example fails with `No module named PIL`

The Python runtime image is outdated. Rebuild runtime images:

```powershell
.\build-runtime-images.ps1
```

### New frontend changes do not appear

Refresh the page. Static asset version strings in `index.html` are used to bust stale browser cache after frontend updates.

## Notes

- Each run is isolated in its own container.
- The service is stateless by default.
- Interactive sessions are temporary and best suited for demos.
- Artifacts are stored locally under `data/artifacts`.
- Execution summaries are appended to `data/executions.jsonl`.
- The current frontend is plain HTML/CSS/JavaScript, not React or Vue.
