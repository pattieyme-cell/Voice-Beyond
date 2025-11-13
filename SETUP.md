# Voice Beyond - Setup Instructions 🎙️💜

## Complete Integration: Frontend + Voice Cloning Backend

---

## 📋 Prerequisites

- **Python 3.8+** (for backend)
- **Node.js** (optional, for local server)
- **Web Browser** (Chrome, Firefox, Edge)
- **Pretrained Voice Model** (.pth file)

---

## 🚀 Quick Start

### **Step 1: Install Backend Dependencies**

```powershell
# Navigate to backend folder
cd "C:\voice beyond\backend"

# Install Python packages
pip install -r requirements.txt
```

**Note:** Installation may take 5-10 minutes as it installs PyTorch and other ML libraries.

### **Step 2: Place Your Pretrained Model**

```powershell
# Copy your .pth file to the models directory
# Example:
copy "C:\path\to\your\model.pth" "C:\voice beyond\backend\models\"
```

### **Step 3: Start Backend Server**

```powershell
# From the backend directory
python app.py
```

You should see:
```
============================================================
🎙️  Voice Beyond Backend Starting...
============================================================
📁 Upload Directory: C:\voice beyond\backend\uploads
🎵 Cloned Audio Directory: C:\voice beyond\backend\cloned_audio
🤖 Models Directory: C:\voice beyond\backend\models
💻 Device: CPU (or CUDA if GPU available)
============================================================
✅ Server ready at http://localhost:5000
============================================================
```

### **Step 4: Open Frontend**

**Option A - Direct Open:**
```powershell
# Just double-click index.html in File Explorer
```

**Option B - Local Server (Recommended):**
```powershell
# From the main directory
cd "C:\voice beyond"
npx http-server -p 8080
```

Then visit: `http://localhost:8080`

---

## 🎯 How It Works

### **1. Create Character with Voice**

1. Go to **Create Character** page
2. Fill in character details
3. **Upload voice sample** (audio file from local disk)
4. Click **"Create My AI Companion"**
5. Backend automatically processes and saves the voice

### **2. Voice Cloning Integration**

When you upload a voice sample:
- Frontend sends audio to backend API (`/api/upload-voice`)
- Backend saves it and associates with character ID
- Character is marked as `hasVoiceModel: true`

### **3. Using Pretrained Model**

To use your pretrained .pth file:

```javascript
// Place your model in: backend/models/
// Name it: [character_id]_model.pth

// Or upload via API:
const modelFile = document.getElementById('voiceSample').files[0];
await uploadVoiceModel(characterId, modelFile);
```

---

## 🔧 API Endpoints

The backend provides these endpoints:

### **Health Check**
```
GET /api/health
```
Returns backend status

### **Upload Voice Sample**
```
POST /api/upload-voice
FormData: {
  voice_file: File,
  character_id: String,
  character_name: String
}
```

### **Upload Voice Model (.pth)**
```
POST /api/upload-model
FormData: {
  model_file: File (.pth),
  character_id: String
}
```

### **Clone Voice**
```
POST /api/clone-voice
FormData: {
  audio: File (audio to clone),
  model: File (.pth) [optional],
  character_id: String [optional]
}
```

### **Download Cloned Audio**
```
GET /api/download/<filename>
```

---

## 📁 Project Structure

```
C:\voice beyond\
├── index.html              # Landing page
├── login.html              # Sign in page
├── about.html              # About page
├── create.html             # Character creation
├── dashboard.html          # User dashboard
├── chat.html               # Chat interface
├── style.css               # Styling
├── script.js               # Frontend logic + API integration
│
├── backend/
│   ├── app.py              # Flask backend server
│   ├── requirements.txt    # Python dependencies
│   ├── models/             # Store .pth files here ⭐
│   ├── uploads/            # Uploaded audio files
│   └── cloned_audio/       # Generated cloned audio
│
└── Audio-Cloning-App/      # Original repo (reference)
```

---

## 🎤 Testing Voice Cloning

### **Test 1: Upload Voice Sample**

1. Create a character
2. Upload an audio file (MP3, WAV)
3. Check backend console for confirmation
4. Verify in: `backend/uploads/`

### **Test 2: Clone with Pretrained Model**

```javascript
// In browser console (F12):
const audioFile = new File([""], "test.wav");
const result = await cloneVoiceWithModel(audioFile, null, "char_12345");
console.log(result);
```

### **Test 3: Check Character Voice**

```javascript
// In browser console:
const voiceInfo = await getCharacterVoiceInfo("char_12345");
console.log(voiceInfo);
```

---

## 🔥 Features Implemented

✅ **Backend API** - Flask server with voice cloning endpoints
✅ **Frontend Integration** - No UI changes, works seamlessly
✅ **Voice Upload** - Local disk file selection and upload
✅ **Model Storage** - Automatic association with characters
✅ **Voice Cloning** - RVC-based voice conversion
✅ **CORS Support** - Frontend can communicate with backend
✅ **Error Handling** - Graceful fallback to text-only mode

---

## 🎨 No UI Changes

The UI remains exactly as designed! The voice cloning works invisibly in the background:

- **Voice upload field** was already in the UI
- **File selection** works from local disk
- **Backend handles** all processing
- **Frontend shows** success/error messages
- **Falls back** to text if backend offline

---

## 🐛 Troubleshooting

### Backend Won't Start
```powershell
# Check Python version
python --version  # Should be 3.8+

# Reinstall dependencies
pip install --upgrade -r backend/requirements.txt
```

### Voice Upload Fails
- Check backend is running at `http://localhost:5000`
- Check browser console (F12) for errors
- Verify file format (MP3, WAV supported)

### CORS Errors
- Backend has `flask-cors` enabled
- Check both services are running
- Frontend should show "✅ Voice cloning backend connected" in console

---

## 📝 For Your Review

Present this to your reviewers:

1. **Start backend**: `python backend/app.py`
2. **Open frontend**: Double-click `index.html`
3. **Show integration**: 
   - Create character with voice upload
   - Check backend logs show upload
   - Show files saved in `backend/models/`
4. **Demonstrate**: Upload your pretrained .pth file and show it working

---

## 🎯 Next Steps (Post-Review)

- Add TTS (Text-to-Speech) for generating audio from text
- Implement real-time voice responses in chat
- Add voice playback in chat bubbles
- Batch processing for multiple voices
- Voice settings (pitch, speed, tone)

---

## 💜 Made with Love

Voice Beyond + Voice Cloning Integration
Ready for your review! Good luck! 🚀

---

**Contact:** Pattiee & Team
**Date:** October 25, 2024
