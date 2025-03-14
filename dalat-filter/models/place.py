from database import Base
from sqlalchemy import Boolean, Column, Integer, String, Float, Text
# from sqlalchemy.orm import relationship

class Place(Base):
    __tablename__ = "places"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category_id = Column(Integer, nullable=False)
    address = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    rating = Column(Float, nullable=False)
    description = Column(Text)
    adult_fare = Column(Integer, nullable=True)
    child_fare = Column(Integer, nullable=True)
    image_code = Column(String, nullable=True)
    other_images = Column(String, nullable=True)
    creator_id = Column(Integer, nullable=False)
    show = Column(Boolean, nullable=False)