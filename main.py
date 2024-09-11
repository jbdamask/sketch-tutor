import os
from flask import Flask, render_template, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from models import db, Drawing
from openai import OpenAI
from PIL import Image
import io
import base64


class Base(DeclarativeBase):
    pass


app = Flask(__name__)
app.template_folder = 'templates'
app.static_folder = 'static'
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
app.secret_key = os.urandom(24)
db.init_app(app)

openai_client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/generate_sketch", methods=["POST"])
def generate_sketch():
    subject = request.json["subject"]
    response = openai_client.images.generate(
        model="dall-e-3",
        prompt=f"A simple pencil sketch of a {subject}",
        size="1024x1024",
        quality="standard",
        n=1,
    )

    image_url = response.data[0].url
    return jsonify({"image_url": image_url})


@app.route("/upload_drawing", methods=["POST"])
def upload_drawing():
    file = request.files["drawing"]
    img = Image.open(file.stream)
    img = img.convert("RGB")
    img_io = io.BytesIO()
    img.save(img_io, "JPEG")
    img_str = base64.b64encode(img_io.getvalue()).decode()

    return jsonify({"image_data": f"data:image/jpeg;base64,{img_str}"})


@app.route("/get_feedback", methods=["POST"])
def get_feedback():
    ai_sketch_url = request.json["ai_sketch"]
    user_drawing_url = request.json["user_drawing"]
    user_message = request.json.get("user_message", "")

    if "conversation_history" not in session:
        session["conversation_history"] = []

    system_message = '''You are an expert art teacher. Your goal is to provide constructive, specific feedback to the student on his art. You will compare the user's art to the AI generated art, recognizing that the student's goal was to recreate the image as best they can. Your feedback will be constructive and highly specific, just like you would do in art class. You are careful not to offer too much feedback at once as that could confuse your student. Instead, you identify one or two of the biggest areas of improvement and provide clear instructions on how the student can improve. You will not make silly generalizations like "improve your shading" because that is not what an art teach would say. An art teacher would say, "to improve your shading, you can use a cross hatch technique", for example. Your overall feedback will start and end with something encouraging about the student's art.'''

    conversation_history = session["conversation_history"]
    
    if not conversation_history:
        prompt = f'''
        Compare the AI-generated sketch (first image) and the user's drawing (second image).
        Provide constructive feedback on the user's drawing, highlighting strengths and areas for improvement.
        Focus on aspects such as proportion, shading, line work, and overall composition.
        Limit the feedback to 1-2 concise points.
        '''
    else:
        prompt = f"User's follow-up question or comment: {user_message}"

    messages = [
        {"role": "system", "content": system_message},
        *conversation_history,
        {
            "role": "user",
            "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": ai_sketch_url}},
                {"type": "image_url", "image_url": {"url": user_drawing_url}}
            ],
        }
    ]

    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        max_tokens=300
    )

    feedback = response.choices[0].message.content
    conversation_history.append({"role": "assistant", "content": feedback})
    session["conversation_history"] = conversation_history

    return jsonify({"feedback": feedback})


@app.route("/save_favorite", methods=["POST"])
def save_favorite():
    data = request.json
    new_drawing = Drawing(subject=data["subject"],
                          ai_sketch_url=data["ai_sketch_url"],
                          user_drawing_url=data["user_drawing_url"])
    db.session.add(new_drawing)
    db.session.commit()
    return jsonify({"message": "Drawing saved to favorites"})


@app.route("/portfolio")
def portfolio():
    favorite_drawings = Drawing.query.all()
    return render_template("portfolio.html", drawings=favorite_drawings)


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(host="0.0.0.0", port=5000, debug=True)
