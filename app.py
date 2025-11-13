import os
import datetime
import json
from functools import wraps

from dotenv import load_dotenv
from flask import Flask, request, jsonify, g
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import requests
from pymongo import MongoClient
from bson.objectid import ObjectId

# ---------------------------
# Configuration & Init
# ---------------------------

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# Load configuration from environment
SQLALCHEMY_DATABASE_URI = os.getenv("SQLALCHEMY_DATABASE_URI", "sqlite:///voice_beyond.db")
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "voice_beyond_db")
AI_PROVIDER = os.getenv("AI_PROVIDER", "gemini").lower()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyC8aD9wUWEYlIfhJb5ts0jyPbN0p-HKxzM")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-key")

app.config["SQLALCHEMY_DATABASE_URI"] = SQLALCHEMY_DATABASE_URI
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = JWT_SECRET

# Initialize databases
db = SQLAlchemy(app)

# Try to connect to MongoDB, fallback to None if not available
try:
    mongo_client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=2000)
    mongo_client.server_info()  # Test connection
    mongo_db = mongo_client[MONGO_DB_NAME]
    chats_collection = mongo_db["chats"]  # store conversations per user/character
    print("✅ MongoDB connected successfully")
except Exception as e:
    print(f"⚠️  MongoDB not available: {e}")
    print("⚠️  Chat history will not be persisted (using in-memory storage)")
    mongo_client = None
    mongo_db = None
    chats_collection = None

# ---------------------------
# SQL Models
# ---------------------------

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    characters = db.relationship('Character', backref='owner', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Character(db.Model):
    """A 'character' is the profile the user creates (the person to simulate)
    store small JSON data for personality / sample answers. For heavy data,
    store only references and use file storage / DB.
    """
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    profile_data = db.Column(db.Text, nullable=True)  # JSON text for profile answers (renamed from metadata)
    voice_id = db.Column(db.String(120), nullable=True)  # ElevenLabs voice ID
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def meta(self):
        try:
            return json.loads(self.profile_data) if self.profile_data else {}
        except Exception:
            return {}

with app.app_context():
    db.create_all()

def generate_jwt(user_id, expire_minutes=60*24*7):
    payload = {
        'sub': str(user_id),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=expire_minutes)
    }
    token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')
    # PyJWT returns str in newer versions. Ensure string.
    if isinstance(token, bytes):
        token = token.decode('utf-8')
    return token



def decode_jwt(token):
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload
    except Exception:
        return None


def auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get('Authorization', None)
        if not auth:
            return jsonify({'error': 'Authorization header missing'}), 401
        parts = auth.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return jsonify({'error': 'Invalid auth header format'}), 401
        token = parts[1]
        payload = decode_jwt(token)
        if not payload:
            return jsonify({'error': 'Invalid or expired token'}), 401
        user = User.query.get(int(payload['sub']))
        if not user:
            return jsonify({'error': 'User not found'}), 404
        g.current_user = user
        return f(*args, **kwargs)
    return decorated

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json or {}
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    if not username or not email or not password:
        return jsonify({'error': 'username, email and password are required'}), 400
    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({'error': 'username or email already exists'}), 400
    user = User(username=username, email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    token = generate_jwt(user.id)
    return jsonify({'message': 'user created', 'token': token, 'user': {'id': user.id, 'username': user.username}}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json or {}
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({'error': 'username and password are required'}), 400
    user = User.query.filter((User.username == username) | (User.email == username)).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'invalid credentials'}), 401
    token = generate_jwt(user.id)
    return jsonify({'message': 'login successful', 'token': token, 'user': {'id': user.id, 'username': user.username}})


@app.route('/api/characters', methods=['GET'])
@auth_required
def list_characters():
    user = g.current_user
    chars = Character.query.filter_by(user_id=user.id).all()
    out = [{'id': c.id, 'name': c.name, 'metadata': c.meta(), 'created_at': c.created_at.isoformat()} for c in chars]
    return jsonify(out)

@app.route('/api/characters', methods=['POST'])
@auth_required
def create_character():
    user = g.current_user
    data = request.json or {}
    name = data.get('name')
    metadata = data.get('metadata', {})
    if not name:
        return jsonify({'error': 'name is required'}), 400
    char = Character(user_id=user.id, name=name, profile_data=json.dumps(metadata))
    db.session.add(char)
    db.session.commit()
    return jsonify({'id': char.id, 'name': char.name, 'metadata': metadata}), 201

@app.route('/api/characters/<int:char_id>', methods=['PUT'])
@auth_required
def update_character(char_id):
    user = g.current_user
    char = Character.query.get_or_404(char_id)
    if char.user_id != user.id:
        return jsonify({'error': 'unauthorized'}), 403
    data = request.json or {}
    char.name = data.get('name', char.name)
    if 'metadata' in data:
        char.profile_data = json.dumps(data['metadata'])
    if 'voice_id' in data:
        char.voice_id = data.get('voice_id')
    db.session.commit()
    return jsonify({'id': char.id, 'name': char.name, 'metadata': char.meta(), 'voice_id': char.voice_id})


def call_ai_api(prompt, character_meta=None, user_id=None, max_tokens=256):
    """Wrapper to call configured AI provider and return text reply.
    For development we support OpenAI (text.chat), Ollama (local) and Gemini.
    """
    if AI_PROVIDER == 'gemini':
        
        if not GEMINI_API_KEY:
            raise RuntimeError('GEMINI_API_KEY not set')
        
        # Build system prompt from character metadata
        system_prompt = 'You are a compassionate, supportive person who speaks exactly like the character described. '
        system_prompt += 'Respond naturally as if you are this person, using their personality, tone, and speaking style. '
        
        if character_meta:
            system_prompt += '\n\nCharacter Profile:\n'
            for key, value in character_meta.items():
                if value:
                    system_prompt += f"{key}: {value}\n"
        
        # Combine system prompt and user message for Gemini
        full_prompt = f"{system_prompt}\n\nUser: {prompt}\n\nResponse:"
        
        url = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}'
        headers = {'Content-Type': 'application/json'}
        body = {
            'contents': [{
                'parts': [{
                    'text': full_prompt
                }]
            }],
            'generationConfig': {
                'temperature': 0.9,
                'maxOutputTokens': max_tokens,
                'topP': 0.95,
                'topK': 40
            }
        }
        
        resp = requests.post(url, headers=headers, json=body, timeout=30)
        resp.raise_for_status()
        j = resp.json()
        
        if 'candidates' in j and len(j['candidates']) > 0:
            text = j['candidates'][0]['content']['parts'][0]['text']
            return text
        else:
            raise RuntimeError('No response from Gemini API')
    
    elif AI_PROVIDER == 'openai':
        
        if not OPENAI_API_KEY:
            raise RuntimeError('OPENAI_API_KEY not set')
        url = 'https://api.openai.com/v1/chat/completions'
        headers = {'Authorization': f'Bearer {OPENAI_API_KEY}', 'Content-Type': 'application/json'}
        system_prompt = 'You are a compassionate, supportive assistant that speaks as the trained person would. Keep answers brief and empathetic.'
        if character_meta:
            system_prompt += ' Use this profile information: ' + json.dumps(character_meta)
        body = {
            'model': 'gpt-3.5-turbo',
            'messages': [
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': prompt}
            ],
            'max_tokens': max_tokens,
            'temperature': 0.7
        }
        resp = requests.post(url, headers=headers, json=body, timeout=30)
        resp.raise_for_status()
        j = resp.json()
      
        text = j['choices'][0]['message']['content']
        return text

    elif AI_PROVIDER == 'ollama':
        
        # Simple, concise prompt for faster response
        character_name = character_meta.get('name', 'Friend') if character_meta else 'Friend'
        personality = character_meta.get('personality', 'supportive') if character_meta else 'supportive'
        
        # Keep it short and direct
        simple_prompt = f"You are {character_name}, a {personality} person. Respond warmly and briefly to: {prompt}"
        
        url = OLLAMA_URL.rstrip('/') + '/api/generate'
        body = {
            'model': 'phi3:mini',
            'prompt': simple_prompt,
            'stream': False,
            'options': {
                'temperature': 0.8,
                'num_predict': 100,  # Shorter for speed
                'top_k': 40,
                'top_p': 0.9
            }
        }
        
        resp = requests.post(url, json=body, timeout=300)
        resp.raise_for_status()
        j = resp.json()
      
        if 'response' in j:
            return j['response'].strip()
        else:
            raise RuntimeError('No response from Ollama API')

    else:
        raise RuntimeError('Unsupported AI_PROVIDER: ' + AI_PROVIDER)

@app.route('/api/chat', methods=['POST'])
@auth_required
def chat():
    """Receive a message, store it, call the AI and store the reply.
    Request JSON: {character_id: int, message: str, metadata: {...} }
    Response: {reply: str, message_id: <mongo id>, reply_id: <mongo id>}
    """
    user = g.current_user
    data = request.json or {}
    character_id = data.get('character_id')
    message_text = data.get('message')
    if not message_text:
        return jsonify({'error': 'message is required'}), 400

    character = None
    if character_id:
        character = Character.query.get(character_id)
        if not character or character.user_id != user.id:
            return jsonify({'error': 'character not found or unauthorized'}), 404
        character_meta = character.meta()
    else:
        character_meta = {}

    # Store user message if MongoDB available
    if chats_collection is not None:
        chat_doc = {
            'user_id': user.id,
            'character_id': character_id,
            'role': 'user',
            'text': message_text,
            'created_at': datetime.datetime.utcnow()
        }
        user_msg_id = chats_collection.insert_one(chat_doc).inserted_id
    else:
        user_msg_id = None

    prompt = message_text
    try:
        ai_reply = call_ai_api(prompt, character_meta=character_meta, user_id=user.id)
    except Exception as e:
        
        err_text = f"[AI_ERROR] {str(e)}"
        if chats_collection is not None:
            reply_doc = {
                'user_id': user.id,
                'character_id': character_id,
                'role': 'assistant',
                'text': err_text,
                'created_at': datetime.datetime.utcnow()
            }
            reply_id = chats_collection.insert_one(reply_doc).inserted_id
        else:
            reply_id = None
        return jsonify({'error': 'AI call failed', 'detail': str(e), 'reply_id': str(reply_id) if reply_id else 'N/A'}), 500

    # Store AI reply if MongoDB available
    if chats_collection is not None:
        reply_doc = {
            'user_id': user.id,
            'character_id': character_id,
            'role': 'assistant',
            'text': ai_reply,
            'created_at': datetime.datetime.utcnow()
        }
        reply_id = chats_collection.insert_one(reply_doc).inserted_id
    else:
        reply_id = None

    return jsonify({
        'reply': ai_reply, 
        'message_id': str(user_msg_id) if user_msg_id else 'N/A', 
        'reply_id': str(reply_id) if reply_id else 'N/A'
    })

@app.route('/api/conversation/<int:character_id>', methods=['GET'])
@auth_required
def get_conversation(character_id):
    user = g.current_user
    
    char = Character.query.get_or_404(character_id)
    if char.user_id != user.id:
        return jsonify({'error': 'unauthorized'}), 403
 
    if chats_collection is None:
        return jsonify({'warning': 'MongoDB not available, no chat history stored'}), 200
    
    try:
        limit = int(request.args.get('limit', 50))
        skip = int(request.args.get('skip', 0))
    except ValueError:
        limit = 50
        skip = 0
    cursor = chats_collection.find({'user_id': user.id, 'character_id': character_id}).sort('created_at', 1).skip(skip).limit(limit)
    out = []
    for d in cursor:
        out.append({'id': str(d.get('_id')), 'role': d.get('role'), 'text': d.get('text'), 'created_at': d.get('created_at').isoformat()})
    return jsonify(out)

# Simple endpoint to let frontend (mobile) request creating a TTS audio file (NOTE: voice cloning left out)
@app.route('/api/tts', methods=['POST'])
@auth_required
def tts_endpoint():
    user = g.current_user
    data = request.json or {}
    text = data.get('text')
    character_id = data.get('character_id')
    
    if not text:
        return jsonify({'error': 'text is required'}), 400
    
    # If character_id provided and ElevenLabs is configured, use voice cloning
    if character_id and ELEVENLABS_API_KEY:
        character = Character.query.get(character_id)
        if character and character.user_id == user.id and character.voice_id:
            try:
                # Generate audio with ElevenLabs
                url = f"https://api.elevenlabs.io/v1/text-to-speech/{character.voice_id}"
                headers = {
                    "Accept": "audio/mpeg",
                    "Content-Type": "application/json",
                    "xi-api-key": ELEVENLABS_API_KEY
                }
                payload = {
                    "text": text,
                    "model_id": "eleven_monolingual_v1",
                    "voice_settings": {
                        "stability": 0.5,
                        "similarity_boost": 0.75
                    }
                }
                
                response = requests.post(url, json=payload, headers=headers, timeout=30)
                
                if response.status_code == 200:
                    # Save audio to temporary file and return path
                    import base64
                    audio_b64 = base64.b64encode(response.content).decode('utf-8')
                    return jsonify({
                        'ok': True, 
                        'audio': audio_b64,
                        'format': 'mp3',
                        'voice_id': character.voice_id
                    })
                else:
                    print(f"ElevenLabs error: {response.status_code} - {response.text}")
            except Exception as e:
                print(f"ElevenLabs TTS error: {e}")
    
    # Fallback: return text for client-side TTS
    return jsonify({'ok': True, 'text': text, 'note': 'TTS generation is handled by client or RVC pipeline later'})

# Endpoint to upload voice samples (for later RVC training) - stores metadata only
@app.route('/api/upload_voice_sample', methods=['POST'])
@auth_required
def upload_voice_sample():
    user = g.current_user
    if 'file' not in request.files:
        return jsonify({'error': 'no file uploaded'}), 400
    f = request.files['file']
    filename = f.filename
    # For prototype: save locally under ./uploads/<user_id>/
    upload_dir = os.path.join('uploads', str(user.id))
    os.makedirs(upload_dir, exist_ok=True)
    filepath = os.path.join(upload_dir, filename)
    f.save(filepath)
    # record in MongoDB sample registry
    sample_doc = {
        'user_id': user.id,
        'filename': filename,
        'path': filepath,
        'uploaded_at': datetime.datetime.utcnow()
    }
    if mongo_db is not None:
        sample_id = mongo_db['voice_samples'].insert_one(sample_doc).inserted_id
        return jsonify({'ok': True, 'sample_id': str(sample_id)})
    else:
        return jsonify({'ok': True, 'sample_id': 'N/A', 'note': 'MongoDB not available, sample metadata not stored'})

# ElevenLabs voice endpoints
@app.route('/api/elevenlabs/voices', methods=['GET'])
@auth_required
def list_elevenlabs_voices():
    """List all voices available in user's ElevenLabs account"""
    if not ELEVENLABS_API_KEY:
        return jsonify({'error': 'ElevenLabs API key not configured'}), 400
    
    try:
        url = "https://api.elevenlabs.io/v1/voices"
        headers = {"xi-api-key": ELEVENLABS_API_KEY}
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        return jsonify(response.json())
    except Exception as e:
        return jsonify({'error': f'Failed to fetch voices: {str(e)}'}), 500

@app.route('/api/characters/<int:char_id>/voice', methods=['POST'])
@auth_required
def set_character_voice(char_id):
    """Set ElevenLabs voice ID for a character"""
    user = g.current_user
    char = Character.query.get_or_404(char_id)
    if char.user_id != user.id:
        return jsonify({'error': 'unauthorized'}), 403
    
    data = request.json or {}
    voice_id = data.get('voice_id')
    if not voice_id:
        return jsonify({'error': 'voice_id is required'}), 400
    
    char.voice_id = voice_id
    db.session.commit()
    return jsonify({'message': 'Voice ID updated', 'voice_id': voice_id})

# Health check
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'ai_provider': AI_PROVIDER})

# ---------------------------
# Error handlers
# ---------------------------

@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'not found'}), 404

@app.errorhandler(500)
def internal_error(e):
    return jsonify({'error': 'internal server error', 'detail': str(e)}), 500

# ---------------------------
# Run app (development)
# ---------------------------

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
