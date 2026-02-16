🚀 TaskForge

A modern full-stack task management application built with FastAPI, PostgreSQL, React, and Docker.

TaskForge provides secure authentication, JWT-based access control, refresh tokens, and a clean UI for managing tasks.

🏗 Tech Stack
Backend:

FastAPI
SQLAlchemy (ORM)
PostgreSQL
Alembic (Database migrations)
JWT Authentication (Access + Refresh tokens)
Argon2 password hashing

Frontend:

React (Vite)
TypeScript
Axios
React Router

DevOps:
Docker
Docker Compose

✨ Features:

User Registration & Login
Secure JWT Authentication
Refresh Token Rotation
Protected Routes
Task CRUD Operations
Database Migrations via Alembic
Dockerized Full Stack Setup

📦 Project Structure:
project/
│
├── backend/
│   ├── app/
│   ├── migrations/
│   ├── alembic.ini
│   └── Dockerfile
│
├── frontend/
│   └── Dockerfile
│
└── docker-compose.yml

🐳 Run with Docker (Recommended):

Make sure Docker Desktop is running.

1️⃣ Clone the repository
git clone https://github.com/YOUR_USERNAME/TaskForge.git
cd TaskForge

2️⃣ Start the application
docker compose up --build

3️⃣ Access the app

Frontend: http://localhost:5173

Backend API: http://localhost:8000

API Docs (Swagger): http://localhost:8000/docs

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

📜 License

MIT License © 2026 Abhinav K

🌟 Future Improvements

Role-based access control
Email verification
CI/CD Pipeline
Unit & Integration test expansion
