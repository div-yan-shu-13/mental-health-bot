from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from datetime import datetime, timedelta
import json

from . import db
from .models import MoodEntry

mood = Blueprint('mood', __name__)

@mood.route('/', methods=['POST'])
@login_required
def add_mood():
    data = request.get_json()
    
    # Validate mood score
    mood_score = data.get('mood_score')
    if not mood_score or not (1 <= int(mood_score) <= 10):
        return jsonify({'message': 'Mood score must be between 1 and 10'}), 400
    
    # Create new mood entry
    new_entry = MoodEntry(
        mood_score=mood_score,
        notes=data.get('notes', ''),
        activities=data.get('activities', []),
        user_id=current_user.id
    )
    
    # Add to database
    db.session.add(new_entry)
    
    # Update user streak
    update_user_streak(current_user)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Mood entry saved successfully',
        'entry': new_entry.to_dict(),
        'current_streak': current_user.current_streak,
        'best_streak': current_user.best_streak
    })

@mood.route('/', methods=['GET'])
@login_required
def get_moods():
    # Get filter parameters
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    limit = request.args.get('limit', type=int)
    
    # Build query
    query = MoodEntry.query.filter_by(user_id=current_user.id)
    
    if start_date:
        start = datetime.fromisoformat(start_date)
        query = query.filter(MoodEntry.timestamp >= start)
    
    if end_date:
        end = datetime.fromisoformat(end_date)
        query = query.filter(MoodEntry.timestamp <= end)
    
    # Order by timestamp descending
    query = query.order_by(MoodEntry.timestamp.desc())
    
    # Apply limit if specified
    if limit:
        query = query.limit(limit)
    
    # Execute query
    entries = query.all()
    
    return jsonify({
        'entries': [entry.to_dict() for entry in entries],
        'current_streak': current_user.current_streak,
        'best_streak': current_user.best_streak
    })

@mood.route('/<int:entry_id>', methods=['GET'])
@login_required
def get_mood(entry_id):
    entry = MoodEntry.query.filter_by(id=entry_id, user_id=current_user.id).first_or_404()
    return jsonify(entry.to_dict())

@mood.route('/<int:entry_id>', methods=['PUT'])
@login_required
def update_mood(entry_id):
    entry = MoodEntry.query.filter_by(id=entry_id, user_id=current_user.id).first_or_404()
    
    data = request.get_json()
    
    if 'mood_score' in data:
        mood_score = int(data['mood_score'])
        if not (1 <= mood_score <= 10):
            return jsonify({'message': 'Mood score must be between 1 and 10'}), 400
        entry.mood_score = mood_score
    
    if 'notes' in data:
        entry.notes = data['notes']
    
    if 'activities' in data:
        entry.activities = data['activities']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Mood entry updated successfully',
        'entry': entry.to_dict()
    })

@mood.route('/<int:entry_id>', methods=['DELETE'])
@login_required
def delete_mood(entry_id):
    entry = MoodEntry.query.filter_by(id=entry_id, user_id=current_user.id).first_or_404()
    
    db.session.delete(entry)
    db.session.commit()
    
    return jsonify({'message': 'Mood entry deleted successfully'})

@mood.route('/summary', methods=['GET'])
@login_required
def get_mood_summary():
    """Get mood statistics and summary for visualization"""
    
    # Default to last 30 days if not specified
    days = request.args.get('days', 30, type=int)
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    # Get all entries in the date range
    entries = MoodEntry.query.filter_by(user_id=current_user.id).filter(
        MoodEntry.timestamp >= start_date,
        MoodEntry.timestamp <= end_date
    ).order_by(MoodEntry.timestamp).all()
    
    # Calculate average mood by day of week
    days_of_week = {0: 'Monday', 1: 'Tuesday', 2: 'Wednesday', 
                   3: 'Thursday', 4: 'Friday', 5: 'Saturday', 6: 'Sunday'}
    
    # Initialize mood by day of week
    mood_by_day = {day: {'total': 0, 'count': 0} for day in days_of_week.values()}
    
    # Calculate trends and averages
    for entry in entries:
        day_name = days_of_week[entry.timestamp.weekday()]
        mood_by_day[day_name]['total'] += entry.mood_score
        mood_by_day[day_name]['count'] += 1
    
    # Calculate averages
    for day in mood_by_day:
        if mood_by_day[day]['count'] > 0:
            mood_by_day[day]['average'] = round(mood_by_day[day]['total'] / mood_by_day[day]['count'], 2)
        else:
            mood_by_day[day]['average'] = 0
    
    # Prepare data for charts
    chart_data = {
        'timeline': [{'date': entry.timestamp.isoformat(), 'score': entry.mood_score} for entry in entries],
        'day_of_week': [{'day': day, 'average': mood_by_day[day]['average']} for day in days_of_week.values()]
    }
    
    return jsonify({
        'summary': chart_data,
        'current_streak': current_user.current_streak,
        'best_streak': current_user.best_streak,
        'entry_count': len(entries),
        'average_mood': round(sum(entry.mood_score for entry in entries) / len(entries), 2) if entries else 0
    })

def update_user_streak(user):
    """Update user streak based on mood entries"""
    today = datetime.utcnow().date()
    yesterday = today - timedelta(days=1)
    
    # Check if user has already logged mood today
    today_entry = MoodEntry.query.filter_by(user_id=user.id).filter(
        db.func.date(MoodEntry.timestamp) == today
    ).first()
    
    if today_entry:
        # Already logged today, nothing to do
        return
    
    # Check if user logged mood yesterday
    yesterday_entry = MoodEntry.query.filter_by(user_id=user.id).filter(
        db.func.date(MoodEntry.timestamp) == yesterday
    ).first()
    
    if yesterday_entry:
        # Continue streak
        user.current_streak += 1
    else:
        # Reset streak
        user.current_streak = 1
    
    # Update best streak if needed
    if user.current_streak > user.best_streak:
        user.best_streak = user.current_streak
