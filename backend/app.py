from flask import Flask, session
from flask_cors import CORS
import os
from datetime import timedelta
from dotenv import load_dotenv
from flask import jsonify
from flask_login import login_required
from database import init_app

# Load environment variables
load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Configure app
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-key-for-development')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI', 'sqlite:///app.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SESSION_TYPE'] = 'filesystem'
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=1)
    

    # Production CORS configuration
    cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
    CORS(app, resources={r"/api/*": {
        "origins": cors_origins,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }})

    # Initialize all extensions
    init_app(app)
    
    # Register blueprints
    from auth import auth_bp
    from mood import mood_bp
    from chatbot import chatbot_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(mood_bp, url_prefix='/api/mood')
    app.register_blueprint(chatbot_bp, url_prefix='/api/chatbot')
    
    # Create database tables
    from database import db
    with app.app_context():
        db.create_all()
    
    # Simple test route
    @app.route('/')
    def index():
        return 'Mental Health App API is running!'
        
    @app.route('/api/health')
    def health():
        return {'status': 'ok'}
    
    @app.route('/api/mood', methods=['OPTIONS'])
    @app.route('/api/mood/insights', methods=['OPTIONS'])
    def handle_mood_options():
        response = app.make_default_options_response()
        response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        return response

    @app.route('/api/self_care_tips', methods=['GET'])
    @login_required
    def get_self_care_tips():
        """Return a list of self-care tips"""
        tips = [
            "Try 4-7-8 breathing: Inhale for 4 counts, hold for 7, exhale for 8.",
            "Take 30 seconds to write down one thing you're grateful for today.",
            "Stand up and stretch for 2 minutes to boost your mood and energy.",
            "Focus on your five senses - notice 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.",
            "Speak to yourself today as you would to a good friend.",
            "Drink a glass of water - dehydration can affect your mood.",
            "Set a small, achievable goal for today.",
            "Listen to a song that makes you feel good.",
            "Text someone you care about.",
            "Spend 5 minutes in nature or looking out a window."
        ]
    
        # Get a random tip or return all tips
        return jsonify({"tips": tips})
    
    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000)

