from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os
from dotenv import load_dotenv

from models import db
from auth import auth_bp
from mood import mood_bp
from chatbot import chatbot_bp

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure app
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-key-for-development')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI', 'sqlite:///app.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key')

# Initialize extensions
db.init_app(app)
jwt = JWTManager(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(mood_bp, url_prefix='/api/mood')
app.register_blueprint(chatbot_bp, url_prefix='/api/chatbot')

# Create a simple route for testing
@app.route('/')
def index():
    return 'Mental Health App API is running!'

# Create database tables
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)
