from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from datetime import datetime
from groq import Groq
import json

from . import db
from .models import ChatSession, ChatMessage

chatbot = Blueprint('chatbot', __name__)

def get_groq_client():
    """Initialize and return Groq client"""
    api_key = current_app.config['GROQ_API_KEY']
    return Groq(api_key=api_key)

@chatbot.route('/sessions', methods=['GET'])
@login_required
def get_chat_sessions():
    """Get all chat sessions for the current user"""
    sessions = ChatSession.query.filter_by(user_id=current_user.id).order_by(ChatSession.updated_at.desc()).all()
    return jsonify([session.to_dict() for session in sessions])

@chatbot.route('/sessions', methods=['POST'])
@login_required
def create_chat_session():
    """Create a new chat session"""
    data = request.get_json()
    
    new_session = ChatSession(
        title=data.get('title', 'New Chat'),
        user_id=current_user.id
    )
    
    db.session.add(new_session)
    db.session.commit()
    
    return jsonify(new_session.to_dict())

@chatbot.route('/sessions/<int:session_id>', methods=['GET'])
@login_required
def get_chat_session(session_id):
    """Get a specific chat session and its messages"""
    session = ChatSession.query.filter_by(id=session_id, user_id=current_user.id).first_or_404()
    messages = [message.to_dict() for message in session.messages]
    
    return jsonify({
        'session': session.to_dict(),
        'messages': messages
    })

@chatbot.route('/sessions/<int:session_id>', methods=['PUT'])
@login_required
def update_chat_session(session_id):
    """Update a chat session (e.g., rename it)"""
    session = ChatSession.query.filter_by(id=session_id, user_id=current_user.id).first_or_404()
    data = request.get_json()
    
    if 'title' in data:
        session.title = data['title']
    
    db.session.commit()
    
    return jsonify(session.to_dict())

@chatbot.route('/sessions/<int:session_id>', methods=['DELETE'])
@login_required
def delete_chat_session(session_id):
    """Delete a chat session"""
    session = ChatSession.query.filter_by(id=session_id, user_id=current_user.id).first_or_404()
    
    db.session.delete(session)
    db.session.commit()
    
    return jsonify({'message': 'Session deleted successfully'})

@chatbot.route('/sessions/<int:session_id>/messages', methods=['POST'])
@login_required
def send_message(session_id):
    """Send a message and get AI response"""
    session = ChatSession.query.filter_by(id=session_id, user_id=current_user.id).first_or_404()
    data = request.get_json()
    
    user_message_content = data.get('message', '')
    if not user_message_content:
        return jsonify({'message': 'Message cannot be empty'}), 400
    
    # Save user message
    user_message = ChatMessage(
        content=user_message_content,
        role='user',
        session_id=session_id
    )
    db.session.add(user_message)
    db.session.commit()
    
    # Prepare conversation history for the AI
    messages = []
    
    # System message to set the context for mental health support
    messages.append({
        "role": "system",
        "content": """You are a compassionate mental health support assistant designed to provide empathetic responses.
        
        Guidelines:
        - Provide supportive, empathetic responses
        - Offer evidence-based coping strategies when appropriate
        - Never provide medical diagnoses or replace professional help
        - If the user seems at high risk, encourage them to seek immediate help
        - Maintain a warm, understanding tone
        - Keep responses concise and focused on the user's concerns
        """
    })
    
    # Get previous messages for context (limit to last 20 for token constraints)
    previous_messages = ChatMessage.query.filter_by(session_id=session_id).order_by(ChatMessage.timestamp).limit(20).all()
    
    for message in previous_messages:
        messages.append({
            "role": message.role,
            "content": message.content
        })
    
    try:
        # Call Groq API
        client = get_groq_client()
        response = client.chat.completions.create(
            messages=messages,
            model=current_app.config.get('GROQ_MODEL', 'llama3-8b-8192'),
            temperature=0.7,
            max_tokens=1024,
            top_p=1,
            stream=False
        )
        
        ai_content = response.choices[0].message.content
        
        # Save AI response
        ai_message = ChatMessage(
            content=ai_content,
            role='assistant',
            session_id=session_id
        )
        db.session.add(ai_message)
        
        # Update session's updated_at timestamp
        session.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'user_message': user_message.to_dict(),
            'ai_message': ai_message.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
