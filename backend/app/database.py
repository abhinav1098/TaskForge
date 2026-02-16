from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import Settings, get_settings

settings = get_settings()

engine = create_engine(
    settings.DATABASE_URL,

    # Connection pool tuning
    pool_size=5,            # Number of persistent connections
    max_overflow=10,        # Extra connections beyond pool_size
    pool_timeout=30,        # Seconds to wait before giving up
    pool_recycle=1800,      # Recycle connections every 30 min
    pool_pre_ping=True,     # Detect dead connections

    future=True,            # SQLAlchemy 2.x behavior
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    future=True,
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
