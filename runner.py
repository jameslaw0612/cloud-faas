import io
import json
import tarfile
from datetime import datetime, timezone
from pathlib import Path

import docker
from docker.errors import DockerException, ImageNotFound


TIMEOUT_SECONDS = 10
MAX_CODE_SIZE_BYTES = 100_000
MAX_OUTPUT_PREVIEW_LENGTH = 400

APP_ROOT = Path(__file__).parent
DATA_DIR = APP_ROOT / "data"
HISTORY_FILE = DATA_DIR / "executions.jsonl"

RUNTIME_CONFIGS = {
    "python": {
        "image": "faas-python-runtime",
        "filename": "handler.py",
        "extension": ".py",
        "command": ["python", "handler.py"],
    },
    "node": {
        "image": "faas-node-runtime",
        "filename": "handler.js",
        "extension": ".js",
        "command": ["node", "handler.js"],
    },
    "go": {
        "image": "faas-go-runtime",
        "filename": "handler.go",
        "extension": ".go",
        "command": ["sh", "-c", "go run handler.go"],
    },
}

SUPPORTED_LANGUAGES = sorted(RUNTIME_CONFIGS.keys())


def _build_code_archive(filename: str, code: str) -> bytes:
    data = code.encode("utf-8")
    archive_stream = io.BytesIO()

    with tarfile.open(fileobj=archive_stream, mode="w") as archive:
        info = tarfile.TarInfo(name=filename)
        info.size = len(data)
        archive.addfile(info, io.BytesIO(data))

    archive_stream.seek(0)
    return archive_stream.read()


def _get_docker_client():
    return docker.from_env()


def get_runtime_extension(language: str) -> str:
    return RUNTIME_CONFIGS[language]["extension"]


def _write_history(record: dict) -> None:
    DATA_DIR.mkdir(exist_ok=True)
    with HISTORY_FILE.open("a", encoding="utf-8") as history_file:
        history_file.write(json.dumps(record) + "\n")


def _make_history_record(
    *,
    language: str,
    submitted_file: str | None,
    request_source: str,
    response: dict,
) -> dict:
    output_preview = (response.get("output") or response.get("details") or "").strip()
    if len(output_preview) > MAX_OUTPUT_PREVIEW_LENGTH:
        output_preview = output_preview[:MAX_OUTPUT_PREVIEW_LENGTH] + "..."

    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "language": language,
        "submitted_file": submitted_file,
        "request_source": request_source,
        "success": response.get("error") is None,
        "exit_code": response.get("exit_code"),
        "output_preview": output_preview,
        "error": response.get("error"),
    }


def get_recent_executions(limit: int = 10) -> list[dict]:
    if not HISTORY_FILE.exists():
        return []

    with HISTORY_FILE.open("r", encoding="utf-8") as history_file:
        lines = history_file.readlines()

    recent_lines = lines[-limit:]
    return [json.loads(line) for line in reversed(recent_lines)]


def run_function(
    language: str,
    code: str,
    *,
    submitted_file: str | None = None,
    request_source: str = "json",
) -> dict:
    normalized_language = language.strip().lower()
    runtime = RUNTIME_CONFIGS.get(normalized_language)

    if not runtime:
        response = {
            "error": f"Unsupported language: {language}",
            "details": f"Supported languages: {', '.join(SUPPORTED_LANGUAGES)}",
            "language": normalized_language,
            "submitted_file": submitted_file,
            "request_source": request_source,
        }
        _write_history(
            _make_history_record(
                language=normalized_language,
                submitted_file=submitted_file,
                request_source=request_source,
                response=response,
            )
        )
        return response

    code_size = len(code.encode("utf-8"))
    if code_size == 0:
        response = {
            "error": "No code submitted",
            "details": "Provide source code to execute.",
            "language": normalized_language,
            "submitted_file": submitted_file,
            "request_source": request_source,
        }
        _write_history(
            _make_history_record(
                language=normalized_language,
                submitted_file=submitted_file,
                request_source=request_source,
                response=response,
            )
        )
        return response

    if code_size > MAX_CODE_SIZE_BYTES:
        response = {
            "error": "Code is too large",
            "details": f"Maximum size is {MAX_CODE_SIZE_BYTES} bytes.",
            "language": normalized_language,
            "submitted_file": submitted_file,
            "request_source": request_source,
        }
        _write_history(
            _make_history_record(
                language=normalized_language,
                submitted_file=submitted_file,
                request_source=request_source,
                response=response,
            )
        )
        return response

    container = None

    try:
        client = _get_docker_client()
        container = client.containers.create(
            image=runtime["image"],
            command=runtime["command"],
            working_dir="/function",
            mem_limit="128m",
            cpu_period=100000,
            cpu_quota=50000,
            network_disabled=True,
            detach=True,
        )

        archive = _build_code_archive(runtime["filename"], code)
        container.put_archive("/function", archive)
        container.start()

        try:
            result = container.wait(timeout=TIMEOUT_SECONDS)
        except Exception:
            container.kill()
            response = {
                "error": "Execution timed out",
                "details": f"Container exceeded {TIMEOUT_SECONDS} seconds.",
                "language": normalized_language,
                "submitted_file": submitted_file,
                "request_source": request_source,
            }
            _write_history(
                _make_history_record(
                    language=normalized_language,
                    submitted_file=submitted_file,
                    request_source=request_source,
                    response=response,
                )
            )
            return response

        stdout = container.logs(stdout=True, stderr=False).decode(
            "utf-8", errors="replace"
        )
        stderr = container.logs(stdout=False, stderr=True).decode(
            "utf-8", errors="replace"
        )

        exit_code = result.get("StatusCode", 0)

        if exit_code != 0:
            response = {
                "error": "Runtime error",
                "details": stderr or f"Container exited with status code {exit_code}.",
                "exit_code": exit_code,
                "language": normalized_language,
                "submitted_file": submitted_file,
                "request_source": request_source,
            }
            _write_history(
                _make_history_record(
                    language=normalized_language,
                    submitted_file=submitted_file,
                    request_source=request_source,
                    response=response,
                )
            )
            return response

        response = {
            "output": stdout,
            "exit_code": exit_code,
            "language": normalized_language,
            "submitted_file": submitted_file,
            "request_source": request_source,
        }
        _write_history(
            _make_history_record(
                language=normalized_language,
                submitted_file=submitted_file,
                request_source=request_source,
                response=response,
            )
        )
        return response
    except ImageNotFound:
        response = {
            "error": "Runtime image not found",
            "details": f"Build the Docker image '{runtime['image']}' before running code.",
            "language": normalized_language,
            "submitted_file": submitted_file,
            "request_source": request_source,
        }
        _write_history(
            _make_history_record(
                language=normalized_language,
                submitted_file=submitted_file,
                request_source=request_source,
                response=response,
            )
        )
        return response
    except DockerException as exc:
        response = {
            "error": "Docker is unavailable",
            "details": str(exc),
            "language": normalized_language,
            "submitted_file": submitted_file,
            "request_source": request_source,
        }
        _write_history(
            _make_history_record(
                language=normalized_language,
                submitted_file=submitted_file,
                request_source=request_source,
                response=response,
            )
        )
        return response
    except Exception as exc:
        response = {
            "error": "Execution failed",
            "details": str(exc),
            "language": normalized_language,
            "submitted_file": submitted_file,
            "request_source": request_source,
        }
        _write_history(
            _make_history_record(
                language=normalized_language,
                submitted_file=submitted_file,
                request_source=request_source,
                response=response,
            )
        )
        return response
    finally:
        if container is not None:
            try:
                container.remove(force=True)
            except Exception:
                pass
