import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from backend.app.core.config import settings

logger = logging.getLogger("pmfby_db")

Base = declarative_base()

def run_migrations(engine):
    """
    Performs non-destructive database migrations to ensure all required Phase 4
    columns exist in existing tables (e.g. crop_images) without dropping data.
    """
    from sqlalchemy import inspect, text
    inspector = inspect(engine)
    if not inspector.has_table("crop_images"):
        return

    existing_cols = {c["name"] for c in inspector.get_columns("crop_images")}
    columns_to_add = [
        ("image_id", "VARCHAR(50)"),
        ("farmer_id", "INTEGER"),
        ("image_path", "VARCHAR(255)"),
        ("original_filename", "VARCHAR(255)"),
        ("file_type", "VARCHAR(50) DEFAULT 'image/jpeg'"),
        ("file_size", "INTEGER DEFAULT 0"),
        ("image_hash", "VARCHAR(64)"),
        ("gps_accuracy", "FLOAT DEFAULT 5.0"),
        ("client_capture_time", "VARCHAR(40)"),
        ("server_upload_time", "DATETIME"),
        ("image_quality_status", "VARCHAR(50) DEFAULT 'PASSED'"),
        ("blur_score", "FLOAT DEFAULT 120.0"),
        ("brightness_score", "FLOAT DEFAULT 130.0"),
        ("resolution", "VARCHAR(40) DEFAULT '1920x1080'"),
        ("verification_status", "VARCHAR(50) DEFAULT 'PENDING_REVIEW'"),
        ("ai_analysis_status", "VARCHAR(50) DEFAULT 'PENDING'"),
        ("officer_remarks", "TEXT"),
        ("is_duplicate", "BOOLEAN DEFAULT 0"),
    ]

    with engine.connect() as conn:
        for col_name, col_type in columns_to_add:
            if col_name not in existing_cols:
                try:
                    conn.execute(text(f"ALTER TABLE crop_images ADD COLUMN {col_name} {col_type}"))
                    conn.commit()
                    logger.info("Migrated crop_images: added column %s", col_name)
                except Exception as e:
                    logger.warning("Migration note for %s: %s", col_name, e)

def get_engine():
    target_url = settings.DATABASE_URL
    try:
        if target_url.startswith("mysql"):
            # Test connection with a short timeout
            engine = create_engine(
                target_url,
                pool_pre_ping=True,
                pool_recycle=3600,
                connect_args={"connect_timeout": 3}
            )
            # Try connecting
            with engine.connect() as conn:
                logger.info("Successfully connected to MySQL database: %s", target_url.split('@')[-1])
            return engine
        else:
            return create_engine(target_url, connect_args={"check_same_thread": False})
    except Exception as exc:
        logger.warning(
            "MySQL connection failed (%s). Initializing persistent SQLite fallback engine for PMFBY.",
            str(exc)
        )
        fallback_url = "sqlite:///./pmfby_crop.db"
        return create_engine(fallback_url, connect_args={"check_same_thread": False})

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

