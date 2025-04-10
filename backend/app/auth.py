from flask import Blueprint, request, jsonify, current_app
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash
import jwt
from datetime import datetime, timedelta

from . import db
from .models import User

auth = Blueprint('auth', __name__)

@auth.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Check if email already exists
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({'message': 'Email already registered'}), 400
    
    # Create new user
    new_user = User(
        email=data.get('email'),
        name=data.get('name'),
        password=data.get('password')
    )
    
    # Add to database
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'message': 'User registered successfully'}), 201

@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Find user by email
    user = User.query.filter_by(email=data.get('email')).first()
    
    # Check if user exists and password is correct
    if not user or not user.verify_password(data.get('password')):
        return jsonify({'message': 'Invalid email or password'}), 401
    
    # Log in the user
    login_user(user, remember=data.get('remember', False))
    
    # Generate token
    token = jwt.encode(
        {
            'sub': user.id,
            'name': user.name,
            'email': user.email,
            'exp': datetime.utcnow() + timedelta(days=1)
        },
        current_app.config['SECRET_KEY'],
        algorithm='HS256'
    )
    
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': user.to_dict()
    })

@auth.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logout successful'})

@auth.route('/user', methods=['GET'])
@login_required
def get_user():
    return jsonify({'user': current_user.to_dict()})

@auth.route('/user', methods=['PUT'])
@login_required
def update_user():
    data = request.get_json()
    
    if 'name' in data:
        current_user.name = data['name']
    
    if 'password' in data:
        current_user.password = data['password']
    
    db.session.commit()
    
    return jsonify({
        'message': 'User updated successfully',
        'user': current_user.to_dict()
    })
