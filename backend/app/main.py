from flask import Blueprint, jsonify, current_app

main = Blueprint('main', __name__)

@main.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'message': 'API is running'
    })

@main.route('/resources', methods=['GET'])
def get_resources():
    """Return mental health resources"""
    resources = [
        {
            'name': 'National Suicide Prevention Lifeline',
            'description': 'Provides 24/7, free and confidential support for people in distress.',
            'phone': '988 or 1-800-273-8255',
            'url': 'https://suicidepreventionlifeline.org/'
        },
        {
            'name': 'Crisis Text Line',
            'description': 'Text HOME to 741741 from anywhere in the USA to text with a trained Crisis Counselor.',
            'url': 'https://www.crisistextline.org/'
        },
        {
            'name': 'SAMHSA\'s National Helpline',
            'description': 'Treatment referral and information service for individuals and families facing mental health or substance use disorders.',
            'phone': '1-800-662-4357',
            'url': 'https://www.samhsa.gov/find-help/national-helpline'
        }
    ]
    
    return jsonify(resources)
