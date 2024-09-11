from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

db = SQLAlchemy()

class Drawing(db.Model):
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    subject: Mapped[str] = mapped_column(String, nullable=False)
    ai_sketch_url: Mapped[str] = mapped_column(String, nullable=False)
    user_drawing_url: Mapped[str] = mapped_column(String, nullable=False)
