from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from jose import JWTError, jwt

from ..database import get_db
from ..models import UserDB, RefreshTokenDB
from ..schemas import UserCreate, UserResponse, Token, TokenPair, RefreshRequest
from ..security import hash_password, verify_password
from ..dependencies.auth import (
    create_access_token,
    create_refresh_token,
    SECRET_KEY,
    ALGORITHM,
)

router = APIRouter(prefix="/auth", tags=["Auth"])


# =============================
# REGISTER
# =============================

@router.post("/register", response_model=UserResponse, status_code=201)
def register(user: UserCreate, db: Session = Depends(get_db)):
    hashed_pw = hash_password(user.password)

    db_user = UserDB(
        email=user.email,
        hashed_password=hashed_pw,
    )

    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    return db_user


# =============================
# LOGIN (Returns TokenPair)
# =============================

@router.post("/login", response_model=TokenPair)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = db.query(UserDB).filter(
        UserDB.email == form_data.username
    ).first()

    if not user or not verify_password(
        form_data.password,
        user.hashed_password,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token = create_access_token(
        data={"user_id": user.id},
        expires_delta=timedelta(minutes=15),
    )

    # Create refresh token
    refresh_token = create_refresh_token(
        data={"user_id": user.id},
        expires_delta=timedelta(days=7),
    )

    # Store refresh token in DB
    db_refresh = RefreshTokenDB(
        token=refresh_token,
        user_id=user.id,
        expires_at=datetime.utcnow() + timedelta(days=7),
    )

    db.add(db_refresh)
    db.commit()

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


# =============================
# REFRESH (Token Rotation)
# =============================

@router.post("/refresh", response_model=Token)
def refresh(
    request: RefreshRequest,
    db: Session = Depends(get_db),
):
    refresh_token = request.refresh_token

    try:
        payload = jwt.decode(
            refresh_token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401)

        user_id = payload.get("user_id")

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid refresh token",
        )

    stored_token = db.query(RefreshTokenDB).filter(
        RefreshTokenDB.token == refresh_token
    ).first()

    if not stored_token:
        raise HTTPException(
            status_code=401,
            detail="Refresh token not found",
        )

    if stored_token.expires_at < datetime.utcnow():
        db.delete(stored_token)
        db.commit()
        raise HTTPException(
            status_code=401,
            detail="Refresh token expired",
        )

    # Rotate refresh token (delete old)
    db.delete(stored_token)

    new_refresh_token = create_refresh_token(
        data={"user_id": user_id},
        expires_delta=timedelta(days=7),
    )

    db.add(
        RefreshTokenDB(
            token=new_refresh_token,
            user_id=user_id,
            expires_at=datetime.utcnow() + timedelta(days=7),
        )
    )

    # Create new access token
    new_access_token = create_access_token(
        data={"user_id": user_id},
        expires_delta=timedelta(minutes=15),
    )

    db.commit()

    return {
        "access_token": new_access_token,
        "token_type": "bearer",
    }
