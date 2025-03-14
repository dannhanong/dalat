from sqlalchemy import Column, Integer, ForeignKey
from database import Base

class PlaceService(Base):
    __tablename__ = "place_service"

    place_id = Column(Integer, ForeignKey("places.id", ondelete="CASCADE"), primary_key=True)
    service_id = Column(Integer, ForeignKey("tourism_services.id", ondelete="CASCADE"), primary_key=True)