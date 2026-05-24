import io
import json
import tarfile
import threading
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from queue import Empty, Queue

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
    "javascript": {
        "image": "faas-node-runtime",
        "filename": "handler.js",
        "extension": ".js",
        "command": ["node", "handler.js"],
    },
    "c": {
        "image": "faas-c-runtime",
        "filename": "handler.c",
        "extension": ".c",
        "command": ["sh", "-c", "gcc handler.c -O2 -o handler && ./handler"],
    },
    "cpp": {
        "image": "faas-cpp-runtime",
        "filename": "handler.cpp",
        "extension": ".cpp",
        "command": ["sh", "-c", "g++ handler.cpp -O2 -std=c++17 -o handler && ./handler"],
    },
    "java": {
        "image": "faas-java-runtime",
        "filename": "Main.java",
        "extension": ".java",
        "command": ["sh", "-c", "javac Main.java && java Main"],
    },
    "php": {
        "image": "faas-php-runtime",
        "filename": "handler.php",
        "extension": ".php",
        "command": ["php", "handler.php"],
    },
}

SUPPORTED_LANGUAGES = list(RUNTIME_CONFIGS.keys())


@dataclass
class InteractiveSession:
    session_id: str
    language: str
    container: object
    socket: object
    output_queue: Queue = field(default_factory=Queue)
    reader_thread: threading.Thread | None = None
    active: bool = True
    cleaned_up: bool = False
    cleanup_lock: threading.Lock = field(default_factory=threading.Lock)


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


INTERACTIVE_SESSIONS: dict[str, InteractiveSession] = {}
INTERACTIVE_SESSIONS_LOCK = threading.Lock()


def get_runtime_extension(language: str) -> str:
    return RUNTIME_CONFIGS[language]["extension"]


def _discard_interactive_session(session_id: str) -> None:
    with INTERACTIVE_SESSIONS_LOCK:
        INTERACTIVE_SESSIONS.pop(session_id, None)


def _cleanup_interactive_session(session: InteractiveSession) -> None:
    with session.cleanup_lock:
        if session.cleaned_up:
            return

        session.active = False

        try:
            session.socket.close()
        except Exception:
            pass

        try:
            session.container.remove(force=True)
        except Exception:
            pass

        session.cleaned_up = True


def _interactive_reader(session: InteractiveSession) -> None:
    try:
        while session.active:
            chunk = session.socket.recv(4096)
            if not chunk:
                break

            session.output_queue.put(chunk.decode("utf-8", errors="replace"))
    except Exception as exc:
        error_text = str(exc)
        is_expected_pipe_close = "The pipe has been ended" in error_text

        if session.active and not is_expected_pipe_close:
            session.output_queue.put(f"\n[interactive stream error] {exc}\n")
    finally:
        _cleanup_interactive_session(session)
        session.output_queue.put("\n[interactive session finished]\n")
        session.output_queue.put(None)


def start_interactive_session(language: str, code: str) -> dict:
    normalized_language = language.strip().lower()
    runtime = RUNTIME_CONFIGS.get(normalized_language)
    code_size = len(code.encode("utf-8"))

    if runtime is None:
        return {
            "error": f"Unsupported language: {language}",
            "details": f"Supported languages: {', '.join(SUPPORTED_LANGUAGES)}",
        }

    if code_size == 0:
        return {
            "error": "No code submitted",
            "details": f"Provide {get_language_display_name(normalized_language)} source code to execute.",
        }

    if code_size > MAX_CODE_SIZE_BYTES:
        return {
            "error": "Code is too large",
            "details": f"Maximum size is {MAX_CODE_SIZE_BYTES} bytes.",
        }

    container = None
    socket = None

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
            stdin_open=True,
            tty=True,
        )

        archive = _build_code_archive(runtime["filename"], code)
        container.put_archive("/function", archive)

        socket = container.attach_socket(
            params={
                "stdin": 1,
                "stdout": 1,
                "stderr": 1,
                "stream": 1,
                "logs": 1,
            }
        )

        if hasattr(socket, "settimeout"):
            socket.settimeout(None)

        container.start()

        session_id = uuid.uuid4().hex
        session = InteractiveSession(
            session_id=session_id,
            language=normalized_language,
            container=container,
            socket=socket,
        )

        reader_thread = threading.Thread(
            target=_interactive_reader,
            args=(session,),
            daemon=True,
            name=f"interactive-session-{session_id}",
        )
        session.reader_thread = reader_thread

        with INTERACTIVE_SESSIONS_LOCK:
            INTERACTIVE_SESSIONS[session_id] = session

        reader_thread.start()

        return {"session_id": session_id}
    except ImageNotFound:
        if socket is not None:
            try:
                socket.close()
            except Exception:
                pass
        if container is not None:
            try:
                container.remove(force=True)
            except Exception:
                pass
        return {
            "error": "Runtime image not found",
            "details": f"Build the Docker image '{runtime['image']}' before starting interactive mode.",
        }
    except DockerException as exc:
        if socket is not None:
            try:
                socket.close()
            except Exception:
                pass
        if container is not None:
            try:
                container.remove(force=True)
            except Exception:
                pass
        return {
            "error": "Docker is unavailable",
            "details": str(exc),
        }
    except Exception as exc:
        if socket is not None:
            try:
                socket.close()
            except Exception:
                pass
        if container is not None:
            try:
                container.remove(force=True)
            except Exception:
                pass
        return {
            "error": "Interactive session failed",
            "details": str(exc),
        }


def get_language_display_name(language: str) -> str:
    display_names = {
        "python": "Python",
        "javascript": "JavaScript",
        "c": "C",
        "cpp": "C++",
        "java": "Java",
        "php": "PHP",
    }
    return display_names.get(language, language.upper())


def get_interactive_session(session_id: str) -> InteractiveSession | None:
    with INTERACTIVE_SESSIONS_LOCK:
        return INTERACTIVE_SESSIONS.get(session_id)


def send_interactive_input(session_id: str, text: str) -> bool:
    session = get_interactive_session(session_id)
    if session is None or not session.active:
        return False

    try:
        session.socket.sendall((text + "\n").encode("utf-8"))
        return True
    except Exception:
        return False


def read_interactive_output(session_id: str) -> dict:
    session = get_interactive_session(session_id)
    if session is None:
        return {
            "found": False,
            "active": False,
            "chunks": [],
        }

    chunks: list[str] = []

    while True:
        try:
            chunk = session.output_queue.get_nowait()
        except Empty:
            break

        if chunk is None:
            session.active = False
            _discard_interactive_session(session.session_id)
            break

        chunks.append(chunk)

    return {
        "found": True,
        "active": session.active,
        "chunks": chunks,
    }


def stop_interactive_session(session_id: str) -> bool:
    with INTERACTIVE_SESSIONS_LOCK:
        session = INTERACTIVE_SESSIONS.pop(session_id, None)

    if session is None:
        return False

    _cleanup_interactive_session(session)

    if (
        session.reader_thread is not None
        and session.reader_thread.is_alive()
        and threading.current_thread() is not session.reader_thread
    ):
        session.reader_thread.join(timeout=1)

    session.output_queue.put(None)
    return True


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
            "error": None,
            "details": None,
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
