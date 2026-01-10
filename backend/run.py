import uvicorn
import logging
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.engine.url import make_url
from alembic import command
from alembic.config import Config
from app.core.config import settings
from app.db.init_db import init_db as seed_db
from app.db.session import SessionLocal

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db() -> None:
    try:
        db_url = make_url(settings.DATABASE_URL)
        db_name = db_url.database
        
        if db_url.drivername.startswith('postgresql'):
            auth_url = db_url.set(database='postgres')
        else:
            auth_url = db_url

        engine = create_engine(auth_url)
        
        with engine.connect() as conn:
            conn.execution_options(isolation_level="AUTOCOMMIT")
            result = conn.execute(text(f"SELECT 1 FROM pg_database WHERE datname = '{db_name}'"))
            if not result.fetchone():
                logger.info(f"Database '{db_name}' not found. Creating...")
                conn.execute(text(f"CREATE DATABASE {db_name}"))
                logger.info(f"Database '{db_name}' created successfully.")
            else:
                logger.info(f"Database '{db_name}' already exists.")
        
        # 2. Run Migrations
        run_migrations()

        # 3. Seed Data
        logger.info("Seeding initial data...")
        db = SessionLocal()
        try:
            seed_db(db)
            logger.info("Database seeding completed successfully!")
        finally:
            db.close()
                
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        sys.exit(1)

def run_migrations() -> None:
    try:
        logger.info("Running database migrations...")
        alembic_cfg = Config("alembic.ini")
        command.upgrade(alembic_cfg, "head")
        logger.info("Migrations completed successfully.")
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    # 1. Initialize Database (Create -> Migrate -> Seed)
    # init_db()
    
    # 2. Run Migrations (Already run in init_db)
    # run_migrations()
    
    # 3. Start Server
    logger.info("Starting server...")
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=["app"],
        workers=1
    )