from database import Base
from sqlalchemy import Column, Integer, String

class Hobby(Base):
    __tablename__ = "hobbies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)