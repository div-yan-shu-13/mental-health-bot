from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models import Mood, db
from datetime import datetime, timedelta
import logging

logging.basicConfig(level=logging.DEBUG)

mood_bp = Blueprint('mood', __name__)

@mood_bp.route('/', methods=['POST'], strict_slashes=False)
@login_required
def add_mood():
    logging.debug("POST /api/mood called")
    data = request.get_json()
    logging.debug(f"Request data: {data}")
    
    # Validate mood score
    score = data.get('score')
    if not score or not (1 <= score <= 10):
        return jsonify({'message': 'Mood score must be between 1 and 10'}), 400
    
    try:
        # Create new mood entry
        new_mood = Mood(
            score=score,
            notes=data.get('notes', ''),
            user_id=current_user.id
        )
        
        db.session.add(new_mood)
        db.session.commit()
        
        return jsonify(new_mood.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 500

@mood_bp.route('/', methods=['GET'], strict_slashes=False)
@login_required
def get_moods():
    try:
        # Get all mood entries for the user
        moods = Mood.query.filter_by(user_id=current_user.id).order_by(Mood.created_at.desc()).all()
        
        return jsonify([mood.to_dict() for mood in moods])
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500

@mood_bp.route('/insights', methods=['GET'])
@login_required
def get_insights():
    try:
        # Get mood entries from the last 30 days
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        moods = Mood.query.filter_by(user_id=current_user.id).filter(Mood.created_at >= thirty_days_ago).all()
        
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
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500
