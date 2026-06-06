from fastapi import APIRouter, HTTPException
from models import User, UserLogin
from database import users, get_user_by_username, SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import datetime, timedelta
from jose import jwt

router = APIRouter()


@router.post("/login")
def login(user_login: UserLogin):
    user = get_user_by_username(user_login.username)

    # Demo: any listed username + "password123"
    if not user or user_login.password != "password123":
        raise HTTPException(status_code=401, detail="Invalid credentials")

    expires = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token_data = {"sub": user.username, "role": user.role, "exp": expires}
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)

    return {
        "user": user,
        "access_token": token,
        "token_type": "bearer",
    }


@router.get("/", response_model=list)
def get_all_users():
    return users


@router.get("/{user_id}", response_model=User)
def get_user(user_id: int):
    user = next((u for u in users if u.id == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
