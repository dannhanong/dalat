from database import Base
from sqlalchemy import Column, Integer, String, Float, Text

class UserFeedback(Base):
    __tablename__ = "user_feedback"

    id = Column(Integer, primary_key=True, index=True)
    comment = Column(String, nullable=False)
    rating = Column(Integer, nullable=False)
    place_id = Column(Integer, nullable=False)
    user_id = Column(Integer, nullable=False)
    created_at = Column(String, nullable=False)