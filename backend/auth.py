from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import models, database
import bcrypt
import passlib.handlers.bcrypt

# 1. passlib expects bcrypt.__about__.__version__ which is missing in recent bcrypt versions
if not hasattr(bcrypt, "__about__"):
    class BcryptAbout:
        def __init__(self):
            self.__version__ = getattr(bcrypt, "__version__", "4.0.0")
    bcrypt.__about__ = BcryptAbout()

# 2. bcrypt 4.0.0+ enforced 72-byte limit with ValueError instead of silent truncation.
# We patch the internal _BcryptBackend because passlib's internal startup tests (detect_wrap_bug)
# trigger this even before we call our own functions.
try:
    original_calc_checksum = passlib.handlers.bcrypt._BcryptBackend._calc_checksum
    def patched_calc_checksum(self, secret):
        if isinstance(secret, str):
            secret = secret.encode("utf-8")
        if len(secret) > 72:
            secret = secret[:72]
        return original_calc_checksum(self, secret)
    passlib.handlers.bcrypt._BcryptBackend._calc_checksum = patched_calc_checksum
except Exception:
    pass

# BCrypt has a 72-character limit for passwords. We truncate here to ensure consistency and avoid errors.
def get_password_hash(password):
    if len(password) > 72:
        password = password[:72]
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    if len(plain_password) > 72:
        plain_password = plain_password[:72]
    return pwd_context.verify(plain_password, hashed_password)

# Security configuration
SECRET_KEY = "my-super-secret-secret" # In production, use environment variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# Handled above with truncation

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

# Minor formatting update

