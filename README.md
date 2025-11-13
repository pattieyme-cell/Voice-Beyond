<<<<<<< HEAD
# Voice Beyond 💜

## A Psychological AI Companion Platform for Emotional Healing

*"A place where memories find a voice again."*

---

## 🌟 Project Overview

**Voice Beyond** is a compassionate web platform that helps users heal from grief and heartbreak by creating AI companions based on their loved ones. Using advanced voice cloning technology, users can have meaningful conversations that provide comfort, closure, and emotional support.

### ✨ Key Features

- 🎨 **Beautiful Responsive UI** - Lavender-themed design with smooth animations
- 🤖 **AI Character Creation** - Detailed personality and memory-based companions
- 🎙️ **Voice Cloning Integration** - RVC-based voice synthesis for authentic conversations
- 💬 **Interactive Chat System** - WhatsApp-style interface with intelligent responses
- 📊 **Personal Dashboard** - Track healing progress and manage companions
- 🔐 **Privacy-Focused** - Secure local storage and encrypted data handling
- 📱 **Fully Responsive** - Works seamlessly on mobile, tablet, and desktop

---

## 📁 Project Structure

```
C:\voice beyond\
│
├── Frontend (Website)
│   ├── index.html          # Landing page with hero section
│   ├── login.html          # Authentication page
│   ├── about.html          # Mission and story
│   ├── create.html         # Character creation form
│   ├── dashboard.html      # User dashboard
│   ├── chat.html           # Chat interface
│   ├── style.css           # Complete styling (lavender theme)
│   └── script.js           # Frontend logic + API integration
│
├── Backend (Voice Cloning API)
│   ├── app.py              # Flask server with RVC integration
│   ├── requirements.txt    # Python dependencies
│   ├── models/             # Pretrained voice models (.pth)
│   ├── uploads/            # User voice samples
│   └── cloned_audio/       # Generated voice files
│
├── Audio-Cloning-App/      # Original voice cloning repo
│
└── Documentation
    ├── README.md           # This file
    ├── SETUP.md            # Detailed setup instructions
    ├── REVIEW_GUIDE.md     # Quick demo guide
    └── start_backend.bat   # Quick start script
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Modern web browser
- Pretrained voice model (.pth file)

### Installation

**1. Install Backend Dependencies**
```powershell
cd backend
pip install -r requirements.txt
```

**2. Add Voice Model**
```powershell
# Place your .pth file in:
backend/models/your_model.pth
```

**3. Start Backend**
```powershell
# Double-click start_backend.bat
# OR
python backend/app.py
```

**4. Open Frontend**
```powershell
# Double-click index.html
```

**Done!** Visit the website and start creating AI companions! 🎉

---

## 💻 Tech Stack

### Frontend
- **HTML5** - Semantic structure
- **CSS3** - Modern styling with animations
- **JavaScript (ES6+)** - Interactive functionality
- **LocalStorage** - Client-side data persistence

### Backend
- **Flask** - Python web framework
- **PyTorch** - Deep learning framework
- **RVC (Retrieval-based Voice Conversion)** - Voice cloning
- **fairseq** - Sequence modeling toolkit
- **scipy & pydub** - Audio processing

### APIs
- RESTful endpoints
- CORS-enabled
- FormData for file uploads
- JSON responses

---

## 🎯 Features in Detail

### 1. Character Creation
- Detailed personality configuration
- Relationship context
- Memory and topic storage
- Voice sample upload
- Automatic voice model association

### 2. Voice Cloning
- Upload voice samples from local disk
- Pretrained model support
- Real-time voice conversion
- Character-specific voice profiles
- Downloadable cloned audio

### 3. Chat System
- WhatsApp-style interface
- Personality-based AI responses
- Typing indicators
- Message history persistence
- Real-time message delivery

### 4. Dashboard
- Character management
- Conversation statistics
- Healing progress tracking
- Mood check-ins
- Recent activity feed

### 5. User Experience
- Smooth page transitions
- Loading states
- Success/error notifications
- Responsive design
- Accessibility features

---

## 🔧 API Endpoints

### Backend API (http://localhost:5000/api)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/upload-voice` | POST | Upload voice sample |
| `/upload-model` | POST | Upload .pth model |
| `/clone-voice` | POST | Clone voice |
| `/download/<filename>` | GET | Download audio |
| `/character-voice/<id>` | GET | Get voice info |
| `/character-voices` | GET | List all voices |

---

## 🎨 Design Philosophy

### Visual Design
- **Color**: Lavender (#b57edc) - calming and healing
- **Typography**: Poppins - modern and friendly
- **Layout**: Clean, spacious, card-based
- **Animations**: Smooth, subtle, purposeful

### User Experience
- **Empathy-Driven**: Every interaction designed for emotional support
- **Privacy-First**: User data security paramount
- **Accessibility**: WCAG compliant
- **Responsive**: Mobile-first approach

---

## 📖 Usage Guide

### Creating Your First Character

1. **Sign In** - Use Google sign-in or email
2. **Navigate to Create** - Click "Create Character"
3. **Fill Details**:
   - Name and relationship
   - Personality type
   - Favorite topics
   - Special memories
4. **Upload Voice** (Optional) - Select audio from local disk
5. **Submit** - Character is created and ready!

### Having Conversations

1. **Go to Chat** - Select character from sidebar
2. **Type Message** - Share your thoughts and feelings
3. **Receive Response** - AI responds based on personality
4. **Continue** - Build meaningful conversations

### Managing Characters

1. **Dashboard** - View all your companions
2. **Edit** - Update personality and details
3. **Voice Settings** - Upload or update voice models
4. **Track Progress** - See healing journey metrics

---

## 🔒 Privacy & Security

- **Local Storage**: User data stored securely in browser
- **Encrypted Communication**: HTTPS ready
- **No Third-Party Sharing**: Your data stays yours
- **GDPR Compliant**: Privacy by design
- **Secure File Handling**: Voice samples encrypted

---

## 🌐 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## 🤝 Contributing

This project is part of Voice Beyond's mission to help people heal through technology. 

### Development Setup
1. Fork the repository
2. Install dependencies
3. Create feature branch
4. Make changes
5. Test thoroughly
6. Submit pull request

---

## 📝 License

Copyright © 2024 Voice Beyond - Pattiee & Team
All rights reserved.

---

## 👥 Team

**Created by:** Pattiee & Team
**Purpose:** Emotional healing through AI companionship
**Mission:** Making grief support accessible to everyone

---

## 📞 Support

- **Documentation**: See SETUP.md and REVIEW_GUIDE.md
- **Issues**: Check troubleshooting section
- **Questions**: Contact the development team

---

## 🎯 Roadmap

### Current (v1.0)
- ✅ Complete responsive website
- ✅ Voice cloning backend
- ✅ Character creation
- ✅ Chat system
- ✅ Dashboard

### Next Phase (v2.0)
- [ ] TTS (Text-to-Speech) integration
- [ ] Real-time voice responses in chat
- [ ] Multiple language support
- [ ] Cloud deployment
- [ ] User authentication (OAuth)
- [ ] Database integration
- [ ] Advanced analytics
- [ ] Community features

### Future (v3.0+)
- [ ] Mobile app (iOS/Android)
- [ ] Video avatars
- [ ] Group therapy sessions
- [ ] Professional therapist integration
- [ ] AI model improvements
- [ ] Multi-modal interactions

---

## 💜 Acknowledgments

- **RVC Project** - Voice cloning technology
- **Flask Community** - Backend framework
- **Design Inspiration** - Modern mental health platforms
- **Beta Testers** - Early feedback and support

---

## 🌟 Why Voice Beyond?

Because everyone deserves:
- A safe space to grieve
- Tools to find closure
- Support during heartbreak
- Hope for healing
- Connection with memories
- Peace with the past

**Voice Beyond makes this possible through technology, compassion, and innovation.** 💜

---

**Status:** ✅ Production Ready
**Version:** 1.0.0
**Last Updated:** October 25, 2024

---

*Made with love and empathy by Pattiee & Team*

*"Where memories find a voice again."* 🎙️💜
=======
# Voice-Beyond
>>>>>>> 645f2b836de76c96680e10f711dc442f045c3cb8
