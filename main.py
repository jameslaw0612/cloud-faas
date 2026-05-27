from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from runner import (
    MAX_CODE_SIZE_BYTES,
    SUPPORTED_LANGUAGES,
    get_saved_artifact,
    get_recent_executions,
    get_runtime_extension,
    read_interactive_output,
    run_function,
    save_artifact_bytes,
    send_interactive_input,
    start_interactive_session,
    stop_interactive_session,
)


APP_ROOT = Path(__file__).parent
UI_PATH = APP_ROOT / "web" / "index.html"

app = FastAPI(
    title="Cloud FaaS Demo",
    description="A minimal Function-as-a-Service API that runs submitted code inside Docker containers.",
    version="2.1.0",
)

app.mount("/static", StaticFiles(directory=APP_ROOT / "web"), name="static")


class FunctionRequest(BaseModel):
    language: str = Field(..., examples=["python"])
    code: str = Field(..., examples=['print("Hello, world!")'])
    request_source: Optional[str] = Field(default=None, examples=["JSON + Download Link"])
    submission_source: Optional[str] = Field(default=None, examples=["Pasted Code"])


class ArtifactResponse(BaseModel):
    artifact_id: str
    artifact_filename: str
    artifact_content_type: str
    artifact_size_bytes: int
    artifact_download_url: str


class FunctionResponse(BaseModel):
    output: Optional[str] = None
    error: Optional[str] = None
    details: Optional[str] = None
    exit_code: Optional[int] = None
    language: Optional[str] = None
    submitted_file: Optional[str] = None
    request_source: Optional[str] = None
    submission_source: Optional[str] = None
    artifact: Optional[ArtifactResponse] = None


class InteractiveStartRequest(BaseModel):
    language: str = Field(..., examples=["python"])
    code: str = Field(..., examples=['name = input("Name: ")\nprint(f"Hello, {name}")'])


class InteractiveStartResponse(BaseModel):
    session_id: Optional[str] = None
    error: Optional[str] = None
    details: Optional[str] = None


class InteractiveInputRequest(BaseModel):
    text: str = Field(..., examples=["Alice"])


class HistoryRecord(BaseModel):
    timestamp: str
    language: str
    submitted_file: Optional[str] = None
    request_source: str
    submission_source: Optional[str] = None
    success: bool
    exit_code: Optional[int] = None
    output_preview: str
    error: Optional[str] = None


def _normalize_language(language: str) -> str:
    normalized = language.strip().lower()
    if normalized not in SUPPORTED_LANGUAGES:
        raise HTTPException(
            status_code=400,
            detail={
                "error": f"Unsupported language: {language}",
                "details": f"Supported languages: {', '.join(SUPPORTED_LANGUAGES)}",
            },
        )
    return normalized


def _validate_code_size(code: str) -> None:
    size = len(code.encode("utf-8"))
    if size == 0:
        raise HTTPException(
            status_code=400,
            detail={"error": "No code submitted", "details": "The uploaded file is empty."},
        )

    if size > MAX_CODE_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "File too large",
                "details": (
                    f"Maximum file size is {MAX_CODE_SIZE_BYTES} bytes for this demo."
                ),
            },
        )


def _validate_file_extension(language: str, filename: str) -> None:
    expected_extension = get_runtime_extension(language)
    if not filename.lower().endswith(expected_extension):
        raise HTTPException(
            status_code=400,
            detail={
                "error": "File extension mismatch",
                "details": (
                    f"Language '{language}' expects a '{expected_extension}' file."
                ),
            },
        )


async def _read_optional_input_file(input_file: UploadFile | None) -> dict[str, bytes]:
    if input_file is None:
        return {}

    filename = Path(input_file.filename or "").name or "input.bin"
    file_bytes = await input_file.read()

    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=400,
            detail={"error": "Input file is empty", "details": "Upload a non-empty image or asset file."},
        )

    return {filename: file_bytes}


@app.get("/", response_class=HTMLResponse)
def home() -> str:
    return UI_PATH.read_text(encoding="utf-8")


@app.get("/api/status")
def status() -> dict:
    return {
        "message": "FaaS is running!",
        "supported_languages": SUPPORTED_LANGUAGES,
        "max_code_size_bytes": MAX_CODE_SIZE_BYTES,
        "interactive_languages": SUPPORTED_LANGUAGES,
        "artifact_delivery_modes": [
            "inline-result",
            "base64-json-response",
            "saved-file-download-url",
            "direct-binary-download",
        ],
        "artifact_directory": "/function/faas_downloads",
    }


@app.get("/history", response_model=list[HistoryRecord])
def history(limit: int = 10) -> list[dict]:
    safe_limit = max(1, min(limit, 50))
    return get_recent_executions(limit=safe_limit)


def _build_text_download(language: str, output: str) -> dict:
    filename = f"{language}-output.txt"
    return save_artifact_bytes(
        filename,
        (output or "").encode("utf-8"),
        content_type="text/plain; charset=utf-8",
    )


def _file_response_from_result(result: dict) -> FileResponse:
    if result.get("error"):
        raise HTTPException(status_code=400, detail=result)

    artifact = result.get("artifact")
    if artifact is None:
        artifact = _build_text_download(
            result.get("language") or "function",
            result.get("output") or "",
        )

    saved = get_saved_artifact(artifact["artifact_id"])
    if saved is None:
        raise HTTPException(
            status_code=404,
            detail={"error": "Artifact not found", "details": "The generated file is no longer available."},
        )

    artifact_path, filename = saved
    preview = (result.get("output") or "")[:200].replace("\r", " ").replace("\n", " ").strip()
    headers = {
        "X-Cloud-FaaS-Filename": artifact["artifact_filename"],
        "X-Cloud-FaaS-Output-Preview": preview,
    }
    return FileResponse(
        path=artifact_path,
        media_type=artifact["artifact_content_type"],
        filename=filename,
        headers=headers,
    )


@app.post("/run", response_model=FunctionResponse)
def run(req: FunctionRequest) -> dict:
    language = _normalize_language(req.language)
    _validate_code_size(req.code)
    return run_function(
        language,
        req.code,
        request_source=req.request_source or "Inline Result",
        submission_source=req.submission_source or "Pasted Code",
    )


@app.post("/run/download")
def run_download(req: FunctionRequest) -> FileResponse:
    language = _normalize_language(req.language)
    _validate_code_size(req.code)
    result = run_function(
        language,
        req.code,
        request_source="Direct File Download",
        submission_source=req.submission_source or "Pasted Code",
    )
    return _file_response_from_result(result)


@app.post("/run/with-input", response_model=FunctionResponse)
async def run_with_input(
    language: str = Form(...),
    code: str = Form(...),
    request_source: str = Form(default="Inline Result"),
    submission_source: str = Form(default="Pasted Code"),
    input_file: UploadFile | None = File(default=None),
) -> dict:
    normalized_language = _normalize_language(language)
    _validate_code_size(code)
    input_files = await _read_optional_input_file(input_file)
    return run_function(
        normalized_language,
        code,
        request_source=request_source,
        submission_source=submission_source,
        input_files=input_files,
    )


@app.post("/run/with-input/download")
async def run_with_input_download(
    language: str = Form(...),
    code: str = Form(...),
    submission_source: str = Form(default="Pasted Code"),
    input_file: UploadFile | None = File(default=None),
) -> FileResponse:
    normalized_language = _normalize_language(language)
    _validate_code_size(code)
    input_files = await _read_optional_input_file(input_file)
    result = run_function(
        normalized_language,
        code,
        request_source="Direct File Download",
        submission_source=submission_source,
        input_files=input_files,
    )
    return _file_response_from_result(result)


@app.post("/run/upload", response_model=FunctionResponse)
async def run_uploaded_file(
    language: str = Form(...),
    file: UploadFile = File(...),
    request_source: str = Form(default="Inline Result"),
    submission_source: str = Form(default="Uploaded File"),
    input_file: UploadFile | None = File(default=None),
) -> dict:
    normalized_language = _normalize_language(language)
    original_filename = file.filename or f"handler{get_runtime_extension(normalized_language)}"
    _validate_file_extension(normalized_language, original_filename)

    file_bytes = await file.read()
    try:
        code = file_bytes.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "Invalid file encoding",
                "details": "Upload a UTF-8 text file for execution.",
            },
        ) from exc

    _validate_code_size(code)
    input_files = await _read_optional_input_file(input_file)

    return run_function(
        normalized_language,
        code,
        submitted_file=original_filename,
        request_source=request_source,
        submission_source=submission_source,
        input_files=input_files,
    )


@app.post("/run/upload/download")
async def run_uploaded_file_download(
    language: str = Form(...),
    file: UploadFile = File(...),
    input_file: UploadFile | None = File(default=None),
) -> FileResponse:
    normalized_language = _normalize_language(language)
    original_filename = file.filename or f"handler{get_runtime_extension(normalized_language)}"
    _validate_file_extension(normalized_language, original_filename)

    file_bytes = await file.read()
    try:
        code = file_bytes.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "Invalid file encoding",
                "details": "Upload a UTF-8 text file for execution.",
            },
        ) from exc

    _validate_code_size(code)
    input_files = await _read_optional_input_file(input_file)

    result = run_function(
        normalized_language,
        code,
        submitted_file=original_filename,
        request_source="Direct File Download",
        submission_source="Uploaded File",
        input_files=input_files,
    )
    return _file_response_from_result(result)


@app.get("/artifacts/{artifact_id}")
def artifact_download(artifact_id: str) -> FileResponse:
    saved = get_saved_artifact(artifact_id)
    if saved is None:
        raise HTTPException(
            status_code=404,
            detail={"error": "Artifact not found", "details": "The generated file does not exist anymore."},
        )

    artifact_path, filename = saved
    return FileResponse(path=artifact_path, filename=filename)


@app.post("/interactive/start", response_model=InteractiveStartResponse)
def start_interactive(req: InteractiveStartRequest) -> dict:
    language = _normalize_language(req.language)
    _validate_code_size(req.code)
    return start_interactive_session(language, req.code)


@app.post("/interactive/stop/{session_id}")
def stop_interactive(session_id: str) -> dict:
    stopped = stop_interactive_session(session_id)
    return {"stopped": stopped}


@app.post("/interactive/input/{session_id}")
def interactive_input(session_id: str, req: InteractiveInputRequest) -> dict:
    sent = send_interactive_input(session_id, req.text)
    return {"sent": sent}


@app.get("/interactive/output/{session_id}")
def interactive_output(session_id: str) -> dict:
    return read_interactive_output(session_id)


@app.post("/interactive/python/start", response_model=InteractiveStartResponse)
def start_interactive_python(req: InteractiveStartRequest) -> dict:
    req.language = "python"
    return start_interactive(req)


@app.post("/interactive/python/stop/{session_id}")
def stop_interactive_python(session_id: str) -> dict:
    return stop_interactive(session_id)


@app.post("/interactive/python/input/{session_id}")
def interactive_python_input(session_id: str, req: InteractiveInputRequest) -> dict:
    return interactive_input(session_id, req)


@app.get("/interactive/python/output/{session_id}")
def interactive_python_output(session_id: str) -> dict:
    return interactive_output(session_id)
