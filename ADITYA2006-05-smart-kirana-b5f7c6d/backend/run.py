from __future__ import annotations

import os

from app import create_app


app = create_app()


if __name__ == "__main__":
    host = os.getenv("APP_HOST", "127.0.0.1")
    port = int(os.getenv("APP_PORT", "5005"))
    app.run(host=host, port=port, debug=app.config.get("DEBUG", False))
