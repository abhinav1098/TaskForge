from passlib.context import CryptContext
from typing import Final

# ==========================
# Password Hashing Config
# ==========================

# Argon2 parameters tuned for modern systems
pwd_context: Final = CryptContext(
    schemes=["argon2"],
    deprecated="auto",
    argon2__memory_cost=102400,   # 100 MB
    argon2__time_cost=2,          # Iterations
    argon2__parallelism=8,        # Threads
)


# ==========================
# Hashing
# ==========================

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# ==========================
# Optional Future Feature
# ==========================

def needs_rehash(hashed_password: str) -> bool:
    """
    Returns True if password should be re-hashed
    (e.g., if security parameters changed).
    """
    return pwd_context.needs_update(hashed_password)
