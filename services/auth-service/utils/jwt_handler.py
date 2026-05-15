import jwt
import datetime
from config import SECRET_KEY


def generate_token(user):
    payload = {
        "user_id": user.id,
        "email": user.email,
        "username": user.username or user.email,
        "role": user.role or "viewer",
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=8)
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    return token
