from __future__ import annotations

from flask import Flask
from flask_cors import CORS

from app.routes import analytics_bp, auth_bp, billing_bp, insights_bp, inventory_bp, voice_bp, suppliers_bp
from app.services.auth_service import AuthService
from app.utils import APIError, atomic_session, error
from app.utils.db import init_db
from config import Settings


def create_app(config_overrides: dict | None = None) -> Flask:
    app = Flask(__name__)
    app.config.from_object(Settings)

    if config_overrides:
        app.config.update(config_overrides)

    CORS(app, resources={r"/*": {"origins": app.config.get("CORS_ORIGINS", "*")}})

    init_db(app.config["DATABASE_URL"], echo=app.config.get("SQL_ECHO", False))

    with app.app_context():
        with atomic_session() as session:
            AuthService.ensure_default_admin(session)

    app.register_blueprint(auth_bp)
    app.register_blueprint(billing_bp)
    app.register_blueprint(inventory_bp)
    app.register_blueprint(suppliers_bp)
    app.register_blueprint(voice_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(insights_bp)

    @app.get("/health")
    def health():
        return {
            "ok": True,
            "service": app.config.get("APP_NAME"),
            "env": app.config.get("ENV"),
        }

    @app.errorhandler(APIError)
    def handle_api_error(exc: APIError):
        return error(exc.message, status_code=exc.status_code, details=exc.details)

    @app.errorhandler(404)
    def handle_not_found(_exc):
        return error("Not found", status_code=404)

    @app.errorhandler(Exception)
    def handle_unexpected(exc: Exception):
        app.logger.exception("Unexpected error", exc_info=exc)
        return error("Internal server error", status_code=500)

    return app
