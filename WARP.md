# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Voice Beyond** is a psychological AI companion platform for emotional healing. It combines voice cloning technology (RVC-based) with AI chatbots to help users heal from grief by creating AI companions that simulate conversations with loved ones.

**Tech Stack:**
- Frontend: Vanilla JavaScript + HTML/CSS (lavender theme)
- Main Backend: Flask (app.py) - User auth, character management, AI chat (Gemini/OpenAI/Ollama)
- Voice Backend: Flask (backend/app.py) - RVC voice cloning with PyTorch
- Databases: SQLite (user/character data), MongoDB (optional, chat history)
- AI Providers: Google Gemini (default), OpenAI, Ollama (local)

## Common Commands

### Backend Development

**Start the main Flask backend:**
```powershell
# From root directory
python app.py
# Server runs at http://localhost:5000
```

**Start voice cloning backend:**
```powershell
# From root directory
cd backend
python app.py
# Or use the batch file
.\start_backend.bat
```

**Install dependencies:**
```powershell
# Main backend
pip install -r requirements.txt

# Voice cloning backend
cd backend
pip install -r requirements.txt
```

### Frontend Development

**Open frontend (development):**
```powershell
# Simple: Double-click index.html in File Explorer
# Or use a local server (recommended):
npx http-server -p 8080
# Then visit http://localhost:8080
```

### Testing

There are no automated tests in this codebase. Manual testing workflow:
1. Start both backend servers (main + voice backend)
2. Open frontend in browser
3. Create character via create.html
4. Test chat functionality via chat.html
5. Check backend console logs for errors

### Database

**SQLite database location:** `instance/voice_beyond.db`

**Reset database:**
```powershell
# Delete the SQLite database to start fresh
Remove-Item -Path "instance\voice_beyond.db" -ErrorAction SilentlyContinue
# Restart app.py - it will recreate tables automatically
```

**MongoDB (optional):**
- Used only for chat history persistence
- If not available, app falls back to in-memory storage
- Configure via `MONGODB_URI` in .env

## Architecture

### Two Separate Backend Systems

This project has **two Flask backends** that serve different purposes:

1. **Main Backend (app.py)** - Port 5000
   - User authentication (JWT-based)
   - Character CRUD operations
   - AI chat integration (Gemini/OpenAI/Ollama)
   - SQLite for user/character data
   - MongoDB for chat history (optional)

2. **Voice Cloning Backend (backend/app.py)** - Port 5000 (separate process)
   - RVC voice cloning using PyTorch
   - Voice sample upload/storage
   - Voice model (.pth) management
   - Audio processing with fairseq, scipy, pydub

**Important:** These are NOT integrated into a single service. They run separately and the frontend communicates with both.

### Frontend Architecture

**Static HTML/CSS/JS architecture:**
- Each page is a separate HTML file (index.html, login.html, create.html, dashboard.html, chat.html, about.html)
- Shared CSS in style.css (lavender theme: #b57edc)
- Shared JavaScript in script.js
- No build process - pure vanilla JS
- Data persistence via localStorage (characters, user session)
- API calls to backend via fetch()

**Key Frontend Files:**
- `script.js` - Main application logic, API integration, event handlers
- `style.css` - Complete styling with CSS animations
- `index.html` - Landing page with hero section
- `create.html` - Character creation form with voice upload
- `chat.html` - WhatsApp-style chat interface
- `dashboard.html` - User dashboard with character management

### Data Flow

**Character Creation:**
1. User fills form in create.html
2. Frontend sends character data to main backend `/api/characters` (POST)
3. If voice sample uploaded → send to voice backend `/api/upload-voice` (POST)
4. Character stored in SQLite + voice mapping in backend/character_voices.json
5. Character saved to localStorage for frontend access

**Chat Flow:**
1. User sends message in chat.html
2. Frontend sends to main backend `/api/chat` (POST) with character metadata
3. Backend calls AI provider (Gemini/OpenAI/Ollama) with personality prompt
4. AI response stored in MongoDB (if available)
5. Response returned to frontend and displayed

**Voice Cloning Flow (partially implemented):**
1. Upload voice sample → backend/uploads/
2. Upload .pth model → backend/models/
3. Call `/api/clone-voice` with audio + character_id
4. RVC processes audio using fairseq + PyTorch
5. Output saved to backend/cloned_audio/
6. Download via `/api/download/<filename>`

### Configuration

**Environment Variables (.env):**
- `AI_PROVIDER` - "gemini", "openai", or "ollama" (default: ollama)
- `GEMINI_API_KEY` - Google Gemini API key
- `OPENAI_API_KEY` - OpenAI API key
- `OLLAMA_URL` - Local Ollama server URL (default: http://localhost:11434)
- `ELEVENLABS_API_KEY` - ElevenLabs voice API key (optional)
- `MONGODB_URI` - MongoDB connection string (optional)
- `JWT_SECRET` - Secret key for JWT tokens
- `SQLALCHEMY_DATABASE_URI` - SQLite database path (default: sqlite:///voice_beyond.db)

**Default AI Provider:** Ollama (local) with phi3:mini model
**Default Voice Model:** Hardcoded path in backend/app.py - must be updated with actual .pth file location

### Database Models

**SQLite (SQLAlchemy):**

```python
User:
  - id (Integer, primary key)
  - username (String, unique)
  - email (String, unique)
  - password_hash (String)
  - created_at (DateTime)

Character:
  - id (Integer, primary key)
  - user_id (Foreign key to User)
  - name (String)
  - profile_data (Text, JSON string) - personality, topics, memories
  - voice_id (String) - ElevenLabs voice ID
  - created_at (DateTime)
```

**MongoDB Collections:**
- `chats` - Conversation messages (role: user/assistant, text, created_at)
- `voice_samples` - Uploaded voice sample metadata

**In-Memory (backend/app.py):**
- `CHARACTER_VOICES` dict - Maps character_id to voice file paths and model paths

## Development Patterns

### Error Handling Strategy

- Backend returns JSON errors with appropriate HTTP status codes
- Frontend checks `response.ok` and shows user-friendly error messages
- Voice backend gracefully degrades if RVC dependencies unavailable
- Main backend falls back to text-only if AI provider unavailable
- MongoDB optional - app works without it (chat history not persisted)

### Authentication Flow

1. User registers/logs in via `/api/register` or `/api/login`
2. Backend returns JWT token
3. Frontend stores token in localStorage as `voiceBeyondToken`
4. All authenticated requests include `Authorization: Bearer <token>` header
5. Backend decorator `@auth_required` validates token and sets `g.current_user`

### AI Provider Integration

The main backend supports three AI providers via `call_ai_api()` function:

1. **Gemini** (default) - Uses Google's Gemini API with temperature 0.9
2. **OpenAI** - Uses gpt-3.5-turbo
3. **Ollama** - Local AI using phi3:mini model

**Character Personality System:**
- Character metadata (personality, relationship, topics, memories) injected into system prompt
- AI responds in character's personality style
- Keep responses brief (2-4 sentences) for conversational feel

### File Locations

**Uploaded Files:**
- Voice samples: `backend/uploads/`
- Voice models (.pth): `backend/models/`
- Cloned audio output: `backend/cloned_audio/`
- User voice samples: `uploads/<user_id>/`

**Data Files:**
- SQLite database: `instance/voice_beyond.db`
- Character voice mapping: `backend/character_voices.json`
- User data (frontend): Browser localStorage

## Important Notes

### Voice Cloning Limitations

- RVC voice cloning requires pretrained .pth model files
- Default model path in `backend/app.py` is hardcoded - update before use
- Voice cloning requires significant CPU/GPU resources
- PyTorch installation can be large (~2GB)
- fairseq has specific version requirements

### Windows-Specific

- Batch files (.bat) for quick startup on Windows
- PowerShell commands in documentation
- Hardcoded Windows paths in some files (e.g., `C:\Users\patri\Downloads\kamal_50e_1750s.pth`)
- Use forward slashes or os.path.join() when modifying paths

### MongoDB Optional

- MongoDB is NOT required - app works without it
- If MongoDB unavailable, chat history is not persisted
- Connection timeout set to 2 seconds in app.py
- Error messages indicate MongoDB status

### Security Considerations

- JWT_SECRET should be changed in production
- API keys in .env should never be committed (already in .gitignore)
- Password hashing uses werkzeug.security
- CORS enabled for all origins (should be restricted in production)
- No HTTPS enforced (local development only)

### Frontend State Management

- No frontend framework - vanilla JavaScript
- State stored in localStorage (characters, user session, messages)
- Page refreshes lose in-memory state
- Characters duplicated between localStorage and backend database
- Sync issues possible between frontend localStorage and backend

## Roadmap Items (from README.md)

**Phase v2.0 (planned):**
- TTS (Text-to-Speech) integration
- Real-time voice responses in chat
- Multiple language support
- Cloud deployment
- OAuth authentication
- Database integration improvements

**Phase v3.0+ (future):**
- Mobile app (iOS/Android)
- Video avatars
- Group therapy sessions
- Professional therapist integration

## Troubleshooting

**Backend won't start:**
```powershell
# Check Python version (need 3.8+)
python --version

# Reinstall dependencies
pip install --upgrade -r requirements.txt
```

**Voice cloning fails:**
- Verify .pth model exists at configured path
- Check PyTorch installation: `python -c "import torch; print(torch.__version__)"`
- Verify fairseq installed: `python -c "import fairseq"`
- Check backend console logs for detailed errors

**AI chat not working:**
- For Gemini: Verify GEMINI_API_KEY in .env
- For Ollama: Ensure Ollama running at http://localhost:11434
  - Test: `curl http://localhost:11434/api/generate`
- For OpenAI: Verify OPENAI_API_KEY in .env
- Check AI_PROVIDER setting in .env

**CORS errors:**
- Ensure both backends running
- Check browser console for specific CORS error
- flask-cors should allow all origins in current setup

**MongoDB connection issues:**
- MongoDB is optional - app will work without it
- Check MONGODB_URI in .env if using MongoDB
- Default: mongodb://localhost:27017
