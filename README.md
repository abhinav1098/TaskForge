🚀 TaskForge

A modern, production-ready full-stack task management application built with FastAPI, PostgreSQL, React (Vite), and Docker.

TaskForge implements secure JWT authentication, refresh token rotation, protected routes, and a fully containerized architecture suitable for real-world deployment.

🏗 Tech Stack
🔹 Backend

FastAPI

SQLAlchemy (ORM)

PostgreSQL

Alembic (Database migrations)

JWT Authentication (Access + Refresh tokens)

Argon2 Password Hashing

Pydantic Settings (Environment-based config)

🔹 Frontend

React (Vite)

TypeScript

Axios (with automatic token refresh interceptor)

React Router

🔹 DevOps

Docker

Docker Compose

Production deployment ready

Environment-based configuration

✨ Features

✅ User Registration & Login

🔐 Secure JWT Authentication

🔄 Refresh Token Rotation

🛡 Protected API Routes

📝 Task CRUD Operations

🗃 Database Migrations via Alembic

🐳 Fully Dockerized Full Stack Setup

🌍 Production Deployment Ready

📦 Project Structure
TaskForge/
│
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── database.py
│   │   ├── config.py
│   │   └── main.py
│   ├── migrations/
│   ├── alembic.ini
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   └── Dockerfile
│
└── docker-compose.yml

🐳 Run with Docker (Recommended)

Ensure Docker Desktop is running.

1️⃣ Clone the Repository
git clone https://github.com/YOUR_USERNAME/TaskForge.git
cd TaskForge

2️⃣ Start the Application
docker compose up --build

3️⃣ Access the Application

Frontend:
http://localhost:5173

Backend API:
http://localhost:8000

Swagger Docs:
http://localhost:8000/docs

🛠 Manual Setup (Without Docker)
Backend
cd backend
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload

Frontend
cd frontend
npm install
npm run dev

🔐 Environment Variables

Create a .env file inside backend/:

SECRET_KEY=your-secret-key
DATABASE_URL=postgresql+psycopg://postgres:password@localhost:5432/taskapp
ACCESS_TOKEN_EXPIRE_MINUTES=30


For production deployment, configure these variables directly in your hosting provider.

🔄 Authentication Flow

User logs in → receives:

Short-lived Access Token

Long-lived Refresh Token

On 401 response:

Frontend automatically calls /auth/refresh

New access token issued

Original request retried

If refresh fails:

User is logged out securely

📜 License

MIT License © 2026 Abhinav K

🚀 Future Improvements

Role-Based Access Control (RBAC)

Email verification & password reset

CI/CD pipeline integration

Expanded unit & integration test coverage

Observability & monitoring
