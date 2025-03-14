from database import Base
from sqlalchemy import Column, ForeignKey, Integer, String

class Hobby(Base):
    __tablename__ = "tourism_services"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category_id = Column(Integer, nullable=False)