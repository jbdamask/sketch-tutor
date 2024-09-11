# Artist's AI Assistant

## Project Description
Artist's AI Assistant is an interactive web application designed to help artists improve their drawing skills using AI-generated feedback and reference images. The application allows users to generate AI sketches based on given subjects, upload their own drawings, receive constructive feedback from an AI art teacher, and save their favorite drawings to a personal portfolio.

## Features
- Generate AI sketches using DALL-E 3
- Upload user drawings
- Rotate uploaded drawings
- Receive AI-powered feedback on drawings
- Save favorite drawings to a portfolio
- View saved drawings in a portfolio gallery

## Architecture

### Backend
- **Framework**: Flask
- **Database**: PostgreSQL with SQLAlchemy ORM
- **AI Integration**: OpenAI API (GPT-4 Vision and DALL-E 3)

### Frontend
- **Templating**: Jinja2
- **Styling**: Tailwind CSS
- **Interactivity**: Vanilla JavaScript

### Key Components
1. **main.py**: Core Flask application with route handlers
2. **models.py**: Database models using SQLAlchemy
3. **templates/**: HTML templates for the web pages
   - base.html: Base template with common structure
   - index.html: Main page for generating sketches and uploading drawings
   - portfolio.html: Gallery of saved drawings
4. **static/js/app.js**: Frontend JavaScript for handling user interactions
5. **static/css/styles.css**: Custom CSS styles (minimal, as Tailwind is primary)

## Setup and Installation
1. Clone the repository
2. Install dependencies: `pip install -r requirements.txt`
3. Set up environment variables:
   - OPENAI_API_KEY
   - DATABASE_URL
4. Initialize the database: `flask db upgrade`
5. Run the application: `python main.py`

## Future Enhancements
- User authentication and personalized portfolios
- Social sharing features for drawings and feedback
- Advanced drawing tools integration
- Progress tracking system with detailed analytics

## Contributing
Contributions to the Artist's AI Assistant project are welcome. Please feel free to submit pull requests or open issues for bugs and feature requests.

## License
[MIT License](LICENSE)
