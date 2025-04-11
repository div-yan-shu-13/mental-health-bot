from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Mood, User
from datetime import datetime, timedelta
from sqlalchemy import func

mood_bp = Blueprint('mood', __name__)

@mood_bp.route('/', methods=['POST'])
@jwt_required()
def add_mood():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate mood score
    score = data.get('score')
    if not score or not (1 <= score <= 10):
        return jsonify({'message': 'Mood score must be between 1 and 10'}), 400
    
    # Create new mood entry
    new_mood = Mood(
        score=score,
        notes=data.get('notes', ''),
        user_id=user_id
    )
    
    db.session.add(new_mood)
    db.session.commit()
    
    return jsonify({
        'id': new_mood.id,
        'score': new_mood.score,
        'notes': new_mood.notes,
        'created_at': new_mood.created_at.isoformat()
    }), 201

@mood_bp.route('/', methods=['GET'])
@jwt_required()
def get_moods():
    user_id = get_jwt_identity()
    
    # Get all mood entries for the user
    moods = Mood.query.filter_by(user_id=user_id).order_by(Mood.created_at.desc()).all()
    
    return jsonify([{
        'id': mood.id,
        'score': mood.score,
        'notes': mood.notes,
        'created_at': mood.created_at.isoformat()
    } for mood in moods])

@mood_bp.route('/insights', methods=['GET'])
@jwt_required()
def get_insights():
    user_id = get_jwt_identity()
    
    # Get mood entries from the last 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    moods = Mood.query.filter_by(user_id=user_id).filter(Mood.created_at >= thirty_days_ago).all()
    
    if not moods:
        return jsonify({
            'message': 'Not enough data for insights',
            'insights': []
        })
    
    # Calculate average mood
    avg_mood = sum(mood.score for mood in moods) / len(moods)
    
    # Generate insights based on mood patterns
    insights = []
    
    if avg_mood < 4:
        insights.append({
            'type': 'concern',
            'message': 'Your mood has been consistently low. Consider speaking with a mental health professional.'
        })
    elif avg_mood < 6:
        insights.append({
            'type': 'suggestion',
            'message': 'Try incorporating more self-care activities into your routine.'
        })
    else:
        insights.append({
            'type': 'positive',
            'message': 'You\'ve been maintaining a positive mood. Keep up the good work!'
        })
    
    # Check for mood variability
    mood_scores = [mood.score for mood in moods]
    if len(mood_scores) >= 5 and max(mood_scores) - min(mood_scores) >= 5:
        insights.append({
            'type': 'observation',
            'message': 'Your mood seems to fluctuate significantly. Tracking triggers might help identify patterns.'
        })
    
    return jsonify({
        'average_mood': round(avg_mood, 1),
        'total_entries': len(moods),
        'insights': insights
    })
