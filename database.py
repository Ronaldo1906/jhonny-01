from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Formato: postgresql://usuario:contraseña@localhost:5432/nombre_bd
DATABASE_URL = "postgresql://postgres:tu_contraseña@localhost:5432/postgres"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


