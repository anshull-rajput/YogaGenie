# YogaGenie

**Your personal AI yoga companion.**

YogaGenie is a production-oriented MERN + Python FastAPI wellness platform centered on personalization, structured yoga plans, progress tracking, and the Yoga Jenny AI coach.

## Architecture

React frontend → Node/Express API → MongoDB

React frontend → Node/Express API → Python FastAPI AI service → modular LLM + yoga knowledge base/RAG

## Monorepo

```text
frontend/      React + Vite + Router + Axios + Context API
backend/       Express + Mongoose + JWT + bcrypt
ai-service/    FastAPI + provider abstraction + RAG-ready knowledge layer
```

## Implementation phases

1. Foundation: monorepo, environment configuration, shared API conventions.
2. Experience: landing, authentication, onboarding, dashboard and navigation.
3. Yoga domain: poses, routines, personalized weekly plans, sessions, progress and streaks.
4. AI: FastAPI Yoga Jenny service, provider abstraction, grounded yoga knowledge retrieval and conversation context.
5. Integration: Node proxy to AI service, persistence, error handling and safety guardrails.
6. Polish: responsive UI, loading/empty/error states, accessibility, security and deployment guidance.

## Local setup

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### AI service

```bash
cd ai-service
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8001
```

MongoDB must be reachable from the backend. API keys belong only in environment variables.

## Safety

Yoga Jenny provides general wellness guidance, not medical diagnosis or treatment. It should encourage users to stop if they experience pain, dizziness or unusual discomfort and recommend qualified professional advice for medical concerns or higher-risk practices.

## Production checklist

- Set strong `JWT_SECRET` and provider credentials outside source control.
- Configure a hosted MongoDB instance and HTTPS CORS origins.
- Use a real LLM provider by setting `LLM_PROVIDER` and its key.
- Put the FastAPI service behind authenticated/private network access in production.
- Add rate limiting, centralized logs, monitoring and a managed secret store before public launch.
