import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db


# ==========================
# TEST CLIENT FIXTURE
# ==========================

@pytest.fixture()
def client():
    SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    TestingSessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=engine,
    )

    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()


# ==========================
# TESTS
# ==========================

def test_register_duplicate_user(client):
    response = client.post(
        "/auth/register",
        json={
            "email": "duplicate@example.com",
            "password": "testpassword"
        }
    )
    assert response.status_code == 201

    response = client.post(
        "/auth/register",
        json={
            "email": "duplicate@example.com",
            "password": "testpassword"
        }
    )
    assert response.status_code == 400


def test_login_success(client):
    client.post(
        "/auth/register",
        json={
            "email": "login@example.com",
            "password": "testpassword"
        }
    )

    response = client.post(
        "/auth/login",
        data={
            "username": "login@example.com",
            "password": "testpassword"
        }
    )

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_create_task_authenticated(client):
    client.post(
        "/auth/register",
        json={
            "email": "taskuser@example.com",
            "password": "testpassword"
        }
    )

    login_response = client.post(
        "/auth/login",
        data={
            "username": "taskuser@example.com",
            "password": "testpassword"
        }
    )

    token = login_response.json()["access_token"]

    response = client.post(
        "/tasks",
        json={
            "title": "Test Task",
            "priority": 1
        },
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Task"
    assert data["priority"] == 1
    assert data["completed"] is False


def test_create_task_unauthorized(client):
    response = client.post(
        "/tasks",
        json={
            "title": "Should Fail",
            "priority": 1
        }
    )

    assert response.status_code == 401


def test_user_cannot_access_another_users_task(client):
    client.post(
        "/auth/register",
        json={
            "email": "userA@example.com",
            "password": "testpassword"
        }
    )

    login_a = client.post(
        "/auth/login",
        data={
            "username": "userA@example.com",
            "password": "testpassword"
        }
    )

    token_a = login_a.json()["access_token"]

    task_response = client.post(
        "/tasks",
        json={"title": "User A Task", "priority": 1},
        headers={"Authorization": f"Bearer {token_a}"}
    )

    task_id = task_response.json()["id"]

    client.post(
        "/auth/register",
        json={
            "email": "userB@example.com",
            "password": "testpassword"
        }
    )

    login_b = client.post(
        "/auth/login",
        data={
            "username": "userB@example.com",
            "password": "testpassword"
        }
    )

    token_b = login_b.json()["access_token"]

    response = client.get(
        f"/tasks/{task_id}",
        headers={"Authorization": f"Bearer {token_b}"}
    )

    assert response.status_code == 404
