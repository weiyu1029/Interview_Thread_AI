from __future__ import annotations

from datetime import UTC, datetime, timedelta

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pwdlib import PasswordHash
from sqlalchemy.orm import Session

from .config import get_settings
from .database import get_db
from .models import User

password_hash = PasswordHash.recommended()
bearer = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    return password_hash.verify(password, hashed)


def create_access_token(user_id: str) -> str:
    settings = get_settings()
    expires = datetime.now(UTC) + timedelta(minutes=settings.access_token_minutes)
    return jwt.encode({"sub": user_id, "exp": expires}, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def _decode_user(credentials: HTTPAuthorizationCredentials | None, db: Session) -> User | None:
    if not credentials:
        return None
    settings = get_settings()
    try:
        payload = jwt.decode(credentials.credentials, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        user = db.get(User, payload.get("sub"))
    except jwt.PyJWTError:
        return None
    return user if user and user.is_active else None


def optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
) -> User | None:
    return _decode_user(credentials, db)


def current_user(user: User | None = Depends(optional_user)) -> User:
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    return user

