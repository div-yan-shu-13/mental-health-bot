from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from groq import Groq
import os

chatbot_bp = Blueprint('chatbot', __name__)

# Initialize Groq client
groq_client = Groq(api_key=os.getenv('GROQ_API_KEY'))
MODEL = "llama3-8b-8192"  # Using Llama 3 8B model

@chatbot_bp.route('/chat', methods=['POST'])
@jwt_required()
def chat():
    user_id = get_jwt_identity()
    data = request.get_json()
    message = data.get('message', '')
    
    if not message:
        return jsonify({'message': 'Message is required'}), 400
    
    try:
        # Call Groq API
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": """You are a compassionate mental health support assistant. 
                    Provide empathetic responses and evidence-based coping strategies for 
                    mental health concerns. Never provide medical diagnoses or replace 
                    professional help. If users express serious distress or suicidal thoughts, 
                    encourage them to seek immediate professional help."""
                },
                {"role": "user", "content": message}
            ],
            model=MODEL,
            temperature=0.7,
            max_tokens=800,
        )
        
        # Extract response
        response = chat_completion.choices[0].message.content
        
        return jsonify({
            'response': response
        })
    
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500
