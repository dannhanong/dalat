from sqlalchemy import Column, Integer, ForeignKey
from database import Base

class PlaceHobby(Base):
    __tablename__ = "place_hobby"

    place_id = Column(Integer, ForeignKey("places.id", ondelete="CASCADE"), primary_key=True)
    hobby_id = Column(Integer, ForeignKey("hobbies.id", ondelete="CASCADE"), primary_key=True)