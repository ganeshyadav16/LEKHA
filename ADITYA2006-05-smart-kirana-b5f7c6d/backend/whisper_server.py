"""Legacy compatibility launcher.

This file is kept for older automation scripts.
It boots the modular backend from run.py.
"""

from __future__ import annotations

import os

from app import create_app


app = create_app()


if __name__ == "__main__":
    host = os.getenv("APP_HOST", "127.0.0.1")
    port = int(os.getenv("APP_PORT", "5005"))
    print("Launching modular backend via legacy compatibility entrypoint")
    app.run(host=host, port=port, debug=app.config.get("DEBUG", False))
