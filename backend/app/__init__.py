from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_login import LoginManager
from flask_cors import CORS

from .config import Config

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
login_manager = LoginManager()
login_manager.login_view = 'auth.login'

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)
    CORS(app)
    
    # Register blueprints
    from .auth import auth as auth_blueprint
    app.register_blueprint(auth_blueprint, url_prefix='/api/auth')
    
    from .mood import mood as mood_blueprint
    app.register_blueprint(mood_blueprint, url_prefix='/api/mood')
    
    from .main import main as main_blueprint
    app.register_blueprint(main_blueprint, url_prefix='/api')
    
    # Create database tables
    with app.app_context():
        db.create_all()
    
    return app
