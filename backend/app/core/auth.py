"""
Authentication: JWT, password hashing, current user/recruiter dependencies.
"""
import hashlib
import secrets
from datetime import datetime, timedelta

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from app.db import get_db
from app import models

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    if hashed_password.startswith("sha256$"):
        parts = hashed_password.split("$")
        if len(parts) == 3:
            _, salt, stored_hash = parts
            computed = hashlib.sha256((plain_password + salt).encode()).hexdigest()
            return computed == stored_hash
        return False
    if len(plain_password.encode("utf-8")) > 72:
        return False
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except ValueError as e:
        if "password cannot be longer than 72 bytes" in str(e):
            return False
        raise e


def get_password_hash(password: str) -> str:
    salt = secrets.token_hex(16)
    hashed = hashlib.sha256((password + salt).encode()).hexdigest()
    return f"sha256${salt}${hashed}"


def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> models.User:
    exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        user_type = payload.get("type")
        if email is None or user_type != "user":
            raise exc
    except JWTError:
        raise exc
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise exc
    return user


def get_current_recruiter(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> models.Recruiter:
    exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        user_type = payload.get("type")
        if email is None or user_type != "recruiter":
            raise exc
    except JWTError:
        raise exc
    recruiter = db.query(models.Recruiter).filter(models.Recruiter.email == email).first()
    if recruiter is None:
        raise exc
    return recruiter
