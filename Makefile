.PHONY: up down logs api frontend worker

up:
	docker compose up --build -d

down:
	docker compose down

logs:
	docker compose logs -f --tail=150

api:
	cd backend && uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

frontend:
	cd frontend && npm run dev

worker:
	cd worker && npm run dev
