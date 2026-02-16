from pydantic import BaseModel, EmailStr
from typing import Optional


# =============================
# TASK SCHEMAS
# =============================

class Task(BaseModel):
    title: str
    priority: int


class TaskCreate(Task):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    priority: Optional[int] = None
    completed: Optional[bool] = None


class TaskResponse(Task):
    id: int
    completed: bool

    class Config:
        from_attributes = True


# =============================
# USER SCHEMAS
# =============================

class User(BaseModel):
    email: EmailStr


class UserCreate(User):
    password: str


class UserResponse(User):
    id: int

    class Config:
        from_attributes = True


# =============================
# AUTH SCHEMAS
# =============================

class Token(BaseModel):
    access_token: str
    token_type: str


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str


class RefreshRequest(BaseModel):
    refresh_token: str
