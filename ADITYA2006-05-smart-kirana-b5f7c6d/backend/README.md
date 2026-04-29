# Voice-Based Kirana Shop Assistant Backend

Production-ready, modular Flask backend for a voice-driven kirana assistant.

## Architecture

```
backend/
	app/
		routes/
		services/
		models/
		utils/
		voice/
		analytics/
	config.py
	run.py
	requirements.txt
```

## Features

- REST API with clean route/service/model separation
- SQLAlchemy ORM with SQLite (offline-first) and PostgreSQL-ready via `DATABASE_URL`
- Browser speech recognition compatible voice command API (text input path)
- Command parser for natural language billing commands
- Atomic billing + inventory sync on checkout
- Transaction history + audit logs
- Apriori data mining for bundle recommendations
- Offline sync event queue with conflict status tracking

## Setup (No Docker)

1. Create or activate venv.
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Run backend:

```bash
python run.py
```

Default: `http://127.0.0.1:5005`

## Configuration

Environment variables:

- `DATABASE_URL` (default SQLite file `backend/kirana.db`)
- `AUTH_REQUIRED` (`true`/`false`, default false)
- `DEFAULT_ADMIN_USERNAME` (default `admin`)
- `DEFAULT_ADMIN_PASSWORD` (default `admin123`)
- `REMOTE_SYNC_URL` optional endpoint for pending event sync

Example PostgreSQL switch:

```bash
set DATABASE_URL=postgresql+psycopg2://user:pass@localhost:5432/kirana
python run.py
```

## Mandatory Endpoints

### Auth

- `POST /login`

### Billing

- `POST /billing/add`
- `POST /billing/remove`
- `POST /billing/undo`
- `POST /billing/discount`
- `GET /billing/current`
- `POST /billing/checkout`

### Inventory

- `GET /inventory`
- `POST /inventory/add`
- `PUT /inventory/update`

### Voice

- `POST /voice/process`

Compatibility endpoint for existing frontend:

- `POST /api/transcribe`

### Analytics

- `GET /analytics/summary`
- `GET /analytics/top-items`
- `GET /analytics/peak-hours`

### Insights

- `GET /insights/recommendations`

## Sample API Calls

### Login

```bash
curl -X POST http://127.0.0.1:5005/login \
	-H "Content-Type: application/json" \
	-d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

### Add inventory item

```bash
curl -X POST http://127.0.0.1:5005/inventory/add \
	-H "Content-Type: application/json" \
	-d "{\"name\":\"Maggi\",\"price\":14,\"stock\":120}"
```

### Add item to bill

```bash
curl -X POST http://127.0.0.1:5005/billing/add \
	-H "Content-Type: application/json" \
	-d "{\"item\":\"maggi\",\"qty\":2}"
```

### Process voice command (text path)

```bash
curl -X POST http://127.0.0.1:5005/voice/process \
	-H "Content-Type: application/json" \
	-d "{\"text\":\"add 2 maggi\",\"execute\":true}"
```

### Compatibility transcribe endpoint

```bash
curl -X POST http://127.0.0.1:5005/api/transcribe \
	-F "audio=@sample.wav"
```

Note: `/api/transcribe` is intentionally disabled (HTTP 410). The app now uses browser-native speech recognition and sends text to `/voice/process`.

## End-to-End Flow

Browser mic (SpeechRecognition) -> Transcript text -> Command Parser -> Billing Service -> Inventory Update -> Transaction Store -> Analytics -> JSON response for UI.

## Testing

Run smoke test:

```bash
python tests/smoke_test.py
```
