from .analytics import analytics_bp
from .auth import auth_bp
from .billing import billing_bp
from .insights import insights_bp
from .inventory import inventory_bp
from .voice import voice_bp
from .suppliers import suppliers_bp

__all__ = [
    "analytics_bp",
    "auth_bp",
    "billing_bp",
    "insights_bp",
    "inventory_bp",
    "voice_bp",
    "suppliers_bp",
]
