from database import Base
from sqlalchemy import Column, Integer

class Wishlist(Base):
    __tablename__ = "wishlists"

    id = Column(Integer, primary_key=True, index=True)
    place_id = Column(Integer, nullable=False)
    user_id = Column(Integer, nullable=False)