from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, Field

from runner import (
    MAX_CODE_SIZE_BYTES,
    SUPPORTED_LANGUAGES,
    get_recent_executions,
    get_runtime_extension,
    run_function,
)


APP_ROOT = Path(__file__).parent
UI_PATH = APP_ROOT / "web" / "index.html"

app = FastAPI(
    title="Cloud FaaS Demo",
    description="A minimal Function-as-a-Service API that runs submitted code inside Docker containers.",
    version="2.0.0",
)


class FunctionRequest(BaseModel):
    language: str = Field(..., examples=["python"])
    code: str = Field(..., examples=['print("Hello, world!")'])


class FunctionResponse(BaseModel):
    output: Optional[str] = None
    error: Optional[str] = None
    details: Optional[str] = None
    exit_code: Optional[int] = None
    language: Optional[str] = None
    submitted_file: Optional[str] = None
    request_source: Optional[str] = None


class HistoryRecord(BaseModel):
    timestamp: str
    language: str
    submitted_file: Optional[str] = None
    request_source: str
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


@app.get("/", response_class=HTMLResponse)
def home() -> str:
    return UI_PATH.read_text(encoding="utf-8")


@app.get("/api/status")
def status() -> dict:
    return {
        "message": "FaaS is running!",
        "supported_languages": SUPPORTED_LANGUAGES,
        "max_code_size_bytes": MAX_CODE_SIZE_BYTES,
    }


@app.get("/history", response_model=list[HistoryRecord])
def history(limit: int = 10) -> list[dict]:
    safe_limit = max(1, min(limit, 50))
    return get_recent_executions(limit=safe_limit)


@app.post("/run", response_model=FunctionResponse)
def run(req: FunctionRequest) -> dict:
    language = _normalize_language(req.language)
    _validate_code_size(req.code)
    return run_function(language, req.code, request_source="json")


@app.post("/run/upload", response_model=FunctionResponse)
async def run_uploaded_file(
    language: str = Form(...),
    file: UploadFile = File(...),
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

    return run_function(
        normalized_language,
        code,
        submitted_file=original_filename,
        request_source="upload",
    )
