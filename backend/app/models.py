from datetime import datetime
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

from . import db, login_manager

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, index=True)
    password_hash = db.Column(db.String(128))
    name = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # User statistics
    current_streak = db.Column(db.Integer, default=0)
    best_streak = db.Column(db.Integer, default=0)
    
    # Relationships
    mood_entries = db.relationship('MoodEntry', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    chat_sessions = db.relationship('ChatSession', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    
    @property
    def password(self):
        raise AttributeError('password is not a readable attribute')
    
    @password.setter
    def password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def verify_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'created_at': self.created_at.isoformat(),
            'current_streak': self.current_streak,
            'best_streak': self.best_streak
        }


class MoodEntry(db.Model):
    __tablename__ = 'mood_entries'
    
    id = db.Column(db.Integer, primary_key=True)
    mood_score = db.Column(db.Integer)  # Scale of 1-10
    notes = db.Column(db.Text)
    activities = db.Column(db.JSON)  # Store activities as JSON
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    def to_dict(self):
        return {
            'id': self.id,
            'mood_score': self.mood_score,
            'notes': self.notes,
            'activities': self.activities or [],
            'timestamp': self.timestamp.isoformat(),
            'user_id': self.user_id
        }


class ChatSession(db.Model):
    __tablename__ = 'chat_sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), default="New Chat")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    # Relationships
    messages = db.relationship('ChatMessage', backref='session', lazy='dynamic', cascade='all, delete-orphan', order_by='ChatMessage.timestamp')
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'user_id': self.user_id,
            'message_count': self.messages.count()
        }


class ChatMessage(db.Model):
    __tablename__ = 'chat_messages'
    
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text)
    role = db.Column(db.String(10))  # 'user' or 'assistant'
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    session_id = db.Column(db.Integer, db.ForeignKey('chat_sessions.id'))
    
    def to_dict(self):
        return {
            'id': self.id,
            'content': self.content,
            'role': self.role,
            'timestamp': self.timestamp.isoformat(),
            'session_id': self.session_id
        }


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))
