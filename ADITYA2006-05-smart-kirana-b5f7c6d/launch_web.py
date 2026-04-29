from __future__ import annotations

import argparse
import mimetypes
import os
import socket
import subprocess
import sys
import threading
import time
import webbrowser
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "backend"


def resolve_backend_python() -> str:
    """Prefer project .venv for backend, unless explicitly overridden."""
    override = os.getenv("BACKEND_PYTHON", "").strip()
    if override:
        return override

    if os.name == "nt":
        venv_python = ROOT_DIR / ".venv" / "Scripts" / "python.exe"
    else:
        venv_python = ROOT_DIR / ".venv" / "bin" / "python"

    if venv_python.is_file():
        return str(venv_python)

    return sys.executable


# Force modern MIME types for static assets.
mimetypes.add_type("text/css", ".css")
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("application/javascript", ".mjs")
mimetypes.add_type("application/json", ".json")
mimetypes.add_type("image/svg+xml", ".svg")
mimetypes.add_type("application/manifest+json", ".webmanifest")


class StaticAssetHandler(SimpleHTTPRequestHandler):
    extensions_map = SimpleHTTPRequestHandler.extensions_map.copy()
    extensions_map.update(
        {
            ".css": "text/css; charset=utf-8",
            ".js": "application/javascript; charset=utf-8",
            ".mjs": "application/javascript; charset=utf-8",
            ".json": "application/json; charset=utf-8",
            ".svg": "image/svg+xml",
            ".webmanifest": "application/manifest+json; charset=utf-8",
        }
    )

    def end_headers(self) -> None:
        # Disable caching in local development so CSS/JS changes are always picked up.
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


def wait_for_port(host: str, port: int, timeout_sec: float) -> bool:
    deadline = time.time() + timeout_sec
    while time.time() < deadline:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.settimeout(0.7)
            if sock.connect_ex((host, port)) == 0:
                return True
        time.sleep(0.2)
    return False


def stop_process(proc: subprocess.Popen | None) -> None:
    if not proc or proc.poll() is not None:
        return
    proc.terminate()
    try:
        proc.wait(timeout=5)
    except subprocess.TimeoutExpired:
        proc.kill()


def start_frontend_server(host: str, port: int) -> tuple[ThreadingHTTPServer, threading.Thread]:
    handler = partial(StaticAssetHandler, directory=str(ROOT_DIR))
    server = ThreadingHTTPServer((host, port), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server, thread


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Start backend + frontend web servers and open the app in your browser."
    )
    parser.add_argument("--host", default="127.0.0.1", help="Bind host for servers")
    parser.add_argument("--frontend-port", type=int, default=5501, help="Frontend server port")
    parser.add_argument("--backend-port", type=int, default=5005, help="Backend server port")
    parser.add_argument("--no-backend", action="store_true", help="Start only frontend server")
    parser.add_argument("--no-open", action="store_true", help="Do not auto-open browser")
    args = parser.parse_args()

    if not BACKEND_DIR.exists() and not args.no_backend:
        print(f"Backend folder not found: {BACKEND_DIR}")
        return 1

    frontend_server: ThreadingHTTPServer | None = None
    frontend_thread: threading.Thread | None = None
    backend_proc: subprocess.Popen | None = None

    try:
        print(
            f"Starting frontend: static server on http://{args.host}:{args.frontend_port} "
            f"(root: {ROOT_DIR})"
        )
        frontend_server, frontend_thread = start_frontend_server(args.host, args.frontend_port)

        if not wait_for_port(args.host, args.frontend_port, timeout_sec=20):
            raise RuntimeError("Frontend server did not start in time")

        if not args.no_backend:
            backend_env = os.environ.copy()
            backend_env["APP_HOST"] = args.host
            backend_env["APP_PORT"] = str(args.backend_port)
            backend_cmd = [resolve_backend_python(), "run.py"]
            print(f"Starting backend: {' '.join(backend_cmd)}")
            backend_proc = subprocess.Popen(backend_cmd, cwd=str(BACKEND_DIR), env=backend_env)

            if wait_for_port(args.host, args.backend_port, timeout_sec=20):
                print(f"Backend ready at http://{args.host}:{args.backend_port}")
            else:
                print("Warning: backend port did not become ready within timeout")

        app_url = f"http://{args.host}:{args.frontend_port}/index.html?v={int(time.time())}"
        print(f"Frontend ready at {app_url}")

        if not args.no_open:
            webbrowser.open(app_url)

        print("Project is running. Press Ctrl+C to stop.")

        while True:
            if frontend_thread and not frontend_thread.is_alive():
                raise RuntimeError("Frontend server exited unexpectedly")
            if backend_proc and backend_proc.poll() is not None:
                print("Warning: backend process exited")
                backend_proc = None
            time.sleep(0.4)

    except KeyboardInterrupt:
        print("Stopping servers...")
    except Exception as exc:
        print(f"Launcher error: {exc}")
        return 1
    finally:
        stop_process(backend_proc)
        if frontend_server is not None:
            frontend_server.shutdown()
            frontend_server.server_close()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
