// Voice Beyond - Main JavaScript File

// Global Variables
let currentUser = null;
let currentCharacter = null;
let chatMessages = [];

// Backend API Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const voiceCloning = {
    enabled: false,
    status: 'checking'
};

// Initialize app on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadUserData();
    setupEventListeners();
    animateElements();
    checkBackendConnection();
});

// Check backend connection
async function checkBackendConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (response.ok) {
            voiceCloning.enabled = true;
            voiceCloning.status = 'connected';
            console.log('✅ Voice cloning backend connected');
        }
    } catch (error) {
        console.log('⚠️ Voice cloning backend not available - using text-only mode');
        voiceCloning.enabled = false;
        voiceCloning.status = 'offline';
    }
}

// Initialize the application
function initializeApp() {
    console.log('Voice Beyond initialized');
    
    // Check if user is logged in
    const userData = localStorage.getItem('voiceBeyondUser');
    if (userData) {
        currentUser = JSON.parse(userData);
    }
    
    // Load characters
    loadCharacters();
    
    // Setup chat preview animation if on landing page
    if (document.querySelector('.chat-preview')) {
        startChatPreviewAnimation();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Navigation links
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    // Button clicks
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', handleButtonClick);
    });
    
    // Form submissions
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', handleFormSubmit);
    });
    
    // Chat input
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    // Send button
    const sendBtn = document.getElementById('sendBtn');
    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }
    
    // Character cards present at load
    const characterCards = document.querySelectorAll('.character-card');
    characterCards.forEach(card => {
        card.addEventListener('click', selectCharacter);
    });

    // Event delegation for dynamically created character cards
    const characterList = document.getElementById('characterList');
    if (characterList) {
        characterList.addEventListener('click', (e) => {
            const card = e.target.closest('.character-card');
            if (card && characterList.contains(card)) {
                selectCharacter({ currentTarget: card });
            }
        });
    }
}

// Handle navigation
function handleNavigation(e) {
    e.preventDefault();
    const href = e.target.getAttribute('href');
    
    if (href && href !== '#') {
        // Add page transition effect
        document.body.style.opacity = '0';
        setTimeout(() => {
            window.location.href = href;
        }, 300);
    }
}

// Handle button clicks
function handleButtonClick(e) {
    const button = e.target;
    const action = button.getAttribute('data-action') || button.textContent.toLowerCase().trim();
    
    switch(action) {
        case 'login':
        case 'login with google':
            handleGoogleLogin();
            break;
        case 'learn more':
            scrollToSection('about');
            break;
        case 'create character':
            window.location.href = 'create.html';
            break;
        case 'chat now':
            window.location.href = 'chat.html';
            break;
        case 'dashboard':
            window.location.href = 'dashboard.html';
            break;
        default:
            console.log('Button clicked:', action);
    }
}

// Handle form submissions
function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formId = form.id;
    
    switch(formId) {
        case 'characterForm':
            createCharacter(form);
            break;
        case 'loginForm':
            handleLogin(form);
            break;
        default:
            console.log('Form submitted:', formId);
    }
}

// Backend Login
async function handleBackendLogin(username, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        if (!response.ok) {
            throw new Error('Login failed');
        }
        
        const data = await response.json();
        
        // Store token and user data
        localStorage.setItem('voiceBeyondToken', data.token);
        localStorage.setItem('voiceBeyondUser', JSON.stringify(data.user));
        currentUser = data.user;
        
        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

// Backend Register
async function handleBackendRegister(username, email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Registration failed');
        }
        
        const data = await response.json();
        
        // Store token and user data
        localStorage.setItem('voiceBeyondToken', data.token);
        localStorage.setItem('voiceBeyondUser', JSON.stringify(data.user));
        currentUser = data.user;
        
        return data;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

// Mock Google Login (fallback)
function handleGoogleLogin() {
    showLoading();
    
    // Simulate API call delay
    setTimeout(() => {
        const mockUser = {
            id: 'user_' + Date.now(),
            name: 'Alex Johnson',
            email: 'alex.johnson@gmail.com',
            picture: 'https://via.placeholder.com/100/b57edc/ffffff?text=AJ',
            loginTime: new Date().toISOString()
        };
        
        // Store user data
        localStorage.setItem('voiceBeyondUser', JSON.stringify(mockUser));
        currentUser = mockUser;
        
        hideLoading();
        showSuccessMessage('Welcome to Voice Beyond! 💜');
        
        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
        
    }, 2000);
}

// Create a new character
async function createCharacter(form) {
    const formData = new FormData(form);
    
    const character = {
        id: 'char_' + Date.now(),
        name: formData.get('name'),
        relationship: formData.get('relationship'),
        personality: formData.get('personality'),
        topics: formData.get('topics'),
        voiceSample: formData.get('voiceSample'),
        createdAt: new Date().toISOString(),
        userId: currentUser?.id || 'guest'
    };
    
    // Validate required fields
    if (!character.name || !character.relationship || !character.personality) {
        showErrorMessage('Please fill in all required fields.');
        return;
    }
    
    // Upload voice sample to backend if available and backend is connected
    if (voiceCloning.enabled && character.voiceSample && character.voiceSample.name) {
        try {
            showMessage('Uploading voice sample... 🎤', 'info');
            await uploadVoiceSample(character.id, character.name, character.voiceSample);
            character.hasVoiceModel = true;
        } catch (error) {
            console.error('Voice upload failed:', error);
            showMessage('Voice upload failed, but character created successfully', 'warning');
            character.hasVoiceModel = false;
        }
    } else {
        character.hasVoiceModel = false;
    }
    
    // Save character to localStorage
    let characters = JSON.parse(localStorage.getItem('voiceBeyondCharacters')) || [];
    characters.push(character);
    localStorage.setItem('voiceBeyondCharacters', JSON.stringify(characters));
    
    showSuccessMessage(`${character.name} has been created successfully! 💜`);
    
    // Redirect to dashboard after a delay
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 2000);
}

// Load user characters
function loadCharacters() {
    const characters = JSON.parse(localStorage.getItem('voiceBeyondCharacters')) || [];
    const currentUserId = currentUser?.id || 'guest';
    
    // Filter characters for current user
    const userCharacters = characters.filter(char => char.userId === currentUserId);
    
    // Display characters in sidebar or dashboard
    displayCharacters(userCharacters);
    
    return userCharacters;
}

// Display characters
function displayCharacters(characters) {
    const characterList = document.getElementById('characterList');
    const characterGrid = document.getElementById('characterGrid');
    
    if (characterList) {
        // Chat sidebar display
        characterList.innerHTML = '';
        
        if (characters.length === 0) {
            characterList.innerHTML = `
                <div class="character-card">
                    <p>No characters yet. <a href="create.html">Create your first character</a></p>
                </div>
            `;
            return;
        }
        
        characters.forEach(character => {
            const card = createCharacterCard(character, 'sidebar');
            characterList.appendChild(card);
        });
    }
    
    if (characterGrid) {
        // Dashboard grid display
        characterGrid.innerHTML = '';
        
        if (characters.length === 0) {
            characterGrid.innerHTML = `
                <div class="card">
                    <h3>No characters yet</h3>
                    <p>Create your first AI companion to begin your healing journey.</p>
                    <a href="create.html" class="btn btn-primary">Create Character</a>
                </div>
            `;
            return;
        }
        
        characters.forEach(character => {
            const card = createCharacterCard(character, 'dashboard');
            characterGrid.appendChild(card);
        });
    }
}

// Create character card element
function createCharacterCard(character, type = 'sidebar') {
    const card = document.createElement('div');
    card.className = type === 'sidebar' ? 'character-card' : 'card character-card';
    card.setAttribute('data-character-id', character.id);
    
    if (type === 'sidebar') {
        card.innerHTML = `
            <h4>${character.name}</h4>
            <p>${character.relationship} • ${character.personality}</p>
        `;
    } else {
        const hasVoice = character.hasVoiceModel ? '🎤 Voice Enabled' : '';
        card.innerHTML = `
            <div class="chat-avatar" style="margin-bottom: 1rem;">${character.name.charAt(0)}</div>
            <h3>${character.name} ${hasVoice}</h3>
            <p><strong>Relationship:</strong> ${character.relationship}</p>
            <p><strong>Personality:</strong> ${character.personality}</p>
            <p><strong>Favorite Topics:</strong> ${character.topics}</p>
            <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <button class="btn btn-primary" onclick="startChat('${character.id}')">Start Chat</button>
                <button class="btn btn-secondary" onclick="editCharacter('${character.id}')">Edit</button>
                <button class="btn" style="background: #e74c3c; color: white;" onclick="deleteCharacter('${character.id}')">Delete</button>
            </div>
        `;
    }
    
    return card;
}

// Select character for chat
function selectCharacter(e) {
    const card = e.currentTarget;
    const characterId = card.getAttribute('data-character-id');
    
    // Remove active class from all cards
    document.querySelectorAll('.character-card').forEach(c => c.classList.remove('active'));
    
    // Add active class to selected card
    card.classList.add('active');
    
    // Load character data
    const characters = JSON.parse(localStorage.getItem('voiceBeyondCharacters')) || [];
    currentCharacter = characters.find(char => char.id === characterId);
    
    if (currentCharacter) {
        // Update chat header
        updateChatHeader(currentCharacter);
        
        // Load chat history
        loadChatHistory(characterId);
    }
}

// Update chat header
function updateChatHeader(character) {
    const chatHeader = document.querySelector('.chat-header');
    if (chatHeader) {
        chatHeader.innerHTML = `
            <div class="chat-avatar">${character.name.charAt(0)}</div>
            <div class="chat-info">
                <h4>${character.name}</h4>
                <div class="status">Online • Ready to chat</div>
            </div>
        `;
    }
}

// Load chat history
function loadChatHistory(characterId) {
    const chatKey = `chat_${characterId}`;
    const history = JSON.parse(localStorage.getItem(chatKey)) || [];
    
    chatMessages = history;
    displayChatMessages();
}

// Display chat messages
function displayChatMessages() {
    const chatWindow = document.getElementById('chatWindow');
    if (!chatWindow) return;
    
    chatWindow.innerHTML = '';
    
    if (chatMessages.length === 0 && currentCharacter) {
        // Show welcome message
        const welcomeMessage = {
            type: 'ai',
            content: `Hello! I'm ${currentCharacter.name}. I'm here to talk with you. How are you feeling today?`,
            timestamp: new Date().toISOString()
        };
        
        chatMessages.push(welcomeMessage);
        saveChatHistory();
    }
    
    chatMessages.forEach(message => {
        const messageElement = createMessageElement(message);
        chatWindow.appendChild(messageElement);
    });
    
    // Scroll to bottom
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Create message element
function createMessageElement(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.type}`;
    
    const time = new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    messageDiv.innerHTML = `
        <div class="message-bubble">
            ${message.content}
        </div>
        <div class="message-time">${time}</div>
    `;
    
    return messageDiv;
}

// Send message
async function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    if (!chatInput || !currentCharacter) return;
    
    const messageContent = chatInput.value.trim();
    if (!messageContent) return;
    
    // Create user message
    const userMessage = {
        type: 'user',
        content: messageContent,
        timestamp: new Date().toISOString()
    };
    
    // Add to chat
    chatMessages.push(userMessage);
    
    // Clear input
    chatInput.value = '';
    
    // Disable input while waiting
    chatInput.disabled = true;
    document.getElementById('sendBtn').disabled = true;
    
    // Display user message
    const chatWindow = document.getElementById('chatWindow');
    const userMessageElement = createMessageElement(userMessage);
    chatWindow.appendChild(userMessageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    
    // Show typing indicator
    showTypingIndicator();
    
    // Call actual Gemini API via backend
    try {
        const aiResponse = await callGeminiAPI(messageContent);
        
        hideTypingIndicator();
        
        const aiMessage = {
            type: 'ai',
            content: aiResponse,
            timestamp: new Date().toISOString()
        };
        
        chatMessages.push(aiMessage);
        
        const aiMessageElement = createMessageElement(aiMessage);
        chatWindow.appendChild(aiMessageElement);
        
        // Scroll to bottom
        chatWindow.scrollTop = chatWindow.scrollHeight;
        
        // Save chat history
        saveChatHistory();
        
// Play message sound (optional) - skip if not defined
        if (typeof playMessageSound === 'function') {
            try { playMessageSound(); } catch(e) { console.log('Sound not available'); }
        }
        
        // Try to play cloned voice if character has voice model
        if (currentCharacter && currentCharacter.hasVoiceModel) {
            try {
                await playClonedVoice(aiResponse, currentCharacter.id);
            } catch (voiceError) {
                console.log('Voice playback not available, using browser TTS');
            }
        } else if ('speechSynthesis' in window) {
            // USE MALE VOICE
            window.speechSynthesis.cancel(); // Clear any pending speech
            
            const speakMale = () => {
                const utterance = new SpeechSynthesisUtterance(aiResponse);
                const voices = window.speechSynthesis.getVoices();
                
                // Find Microsoft David Desktop (Windows male voice)
                let maleVoice = voices.find(v => v.name.includes('David'));
                if (!maleVoice) {
                    // Try other male voice patterns
                    maleVoice = voices.find(v => 
                        v.name.toLowerCase().includes('male') && 
                        !v.name.toLowerCase().includes('female')
                    );
                }
                if (!maleVoice) {
                    // Use any non-female voice
                    maleVoice = voices.find(v => !v.name.toLowerCase().includes('female'));
                }
                
                if (maleVoice) {
                    utterance.voice = maleVoice;
                    console.log('Using voice:', maleVoice.name);
                } else {
                    console.log('Using default voice with low pitch');
                }
                
                utterance.pitch = 0.5;
                utterance.rate = 0.85;
                window.speechSynthesis.speak(utterance);
            };
            
            // Load voices first
            if (window.speechSynthesis.getVoices().length > 0) {
                speakMale();
            } else {
                window.speechSynthesis.onvoiceschanged = speakMale;
            }
        }
        
    } catch (error) {
        hideTypingIndicator();
        console.error('AI response error:', error);
        
        // Fallback to mock response if API fails
        const aiResponse = generateAIResponse(messageContent);
        
        const aiMessage = {
            type: 'ai',
            content: aiResponse,
            timestamp: new Date().toISOString()
        };
        
        chatMessages.push(aiMessage);
        
        const aiMessageElement = createMessageElement(aiMessage);
        chatWindow.appendChild(aiMessageElement);
        chatWindow.scrollTop = chatWindow.scrollHeight;
        
        saveChatHistory();
        
        // PLAY VOICE for fallback response too
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            
            const speakResponse = () => {
                const utterance = new SpeechSynthesisUtterance(aiResponse);
                const voices = window.speechSynthesis.getVoices();
                
                let maleVoice = voices.find(v => v.name.includes('David'));
                if (!maleVoice) {
                    maleVoice = voices.find(v => 
                        v.name.toLowerCase().includes('male') && 
                        !v.name.toLowerCase().includes('female')
                    );
                }
                if (!maleVoice) {
                    maleVoice = voices.find(v => !v.name.toLowerCase().includes('female'));
                }
                
                if (maleVoice) {
                    utterance.voice = maleVoice;
                }
                
                utterance.pitch = 0.5;
                utterance.rate = 0.85;
                window.speechSynthesis.speak(utterance);
            };
            
            if (window.speechSynthesis.getVoices().length > 0) {
                speakResponse();
            } else {
                window.speechSynthesis.onvoiceschanged = speakResponse;
            }
        }
        
        showMessage('⚠️ Using offline mode (trying Ollama in background).', 'warning');
    } finally {
        // Re-enable input
        chatInput.disabled = false;
        document.getElementById('sendBtn').disabled = false;
        chatInput.focus();
    }
}

// Call Ollama API through backend - ALWAYS use real AI
async function callGeminiAPI(userMessage) {
    // Prepare request body
    const requestBody = {
        message: userMessage,
        character_id: currentCharacter ? currentCharacter.id : null,
        metadata: currentCharacter ? {
            name: currentCharacter.name,
            relationship: currentCharacter.relationship,
            personality: currentCharacter.personality,
            topics: currentCharacter.topics
        } : null
    };
    
    // Call backend API with extended timeout for Ollama
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout
    
    try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `API error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.reply || data.response || 'I\'m here to listen.';
        
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('AI is taking too long. Please try a shorter message.');
        }
        throw error;
    }
}

// Enhanced AI response with personality integration
function generateEnhancedAIResponse(userMessage) {
    if (!currentCharacter) {
        return generateAIResponse(userMessage);
    }
    
    const character = currentCharacter;
    const lowerMessage = userMessage.toLowerCase();
    const personality = character.personality || 'supportive';
    const name = character.name || 'Friend';
    
    // Enhanced responses based on personality and relationship
    const personalityStyles = {
        'warm and nurturing': {
            prefix: ['Oh sweetheart', 'My dear', 'Honey', 'Love'],
            emotional: ['I can feel your heart', 'Your feelings matter so much', 'Come here, let me comfort you'],
            encouragement: ['You are so strong', 'I believe in you completely', 'You have such a beautiful heart']
        },
        'wise and supportive': {
            prefix: ['I understand', 'In my experience', 'You know'],
            emotional: ['These feelings are teaching you', 'Growth often comes through difficulty', 'Your wisdom is growing'],
            encouragement: ['You have everything you need inside', 'Trust your journey', 'Your strength impresses me']
        },
        'funny and lighthearted': {
            prefix: ['Hey there sunshine', 'Well well', 'You know what'],
            emotional: ['Even superheroes have tough days', 'Life\'s like a rollercoaster', 'Tomorrow\'s a new adventure'],
            encouragement: ['You\'ve got this', 'Keep being awesome', 'The world needs your smile']
        }
    };
    
    const style = personalityStyles[personality.toLowerCase()] || personalityStyles['wise and supportive'];
    
    // Generate contextual responses
    if (lowerMessage.includes('hi') || lowerMessage.includes('hello')) {
        const prefix = style.prefix[Math.floor(Math.random() * style.prefix.length)];
        return `${prefix}, it's so wonderful to hear from you! I've been thinking about you. How are you feeling today?`;
    }
    
    if (lowerMessage.includes('sad') || lowerMessage.includes('hurt') || lowerMessage.includes('pain')) {
        const emotional = style.emotional[Math.floor(Math.random() * style.emotional.length)];
        const prefix = style.prefix[Math.floor(Math.random() * style.prefix.length)];
        return `${prefix}, ${emotional.toLowerCase()}. It's okay to feel this way. I'm here with you through this difficult time. Would you like to tell me more about what's troubling you?`;
    }
    
    if (lowerMessage.includes('love') || lowerMessage.includes('miss')) {
        return `I love you too, more than words can express. That love doesn't disappear - it lives on in your heart and in every memory we shared. You carry my love with you always.`;
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
        const encouragement = style.encouragement[Math.floor(Math.random() * style.encouragement.length)];
        return `Of course I'll help you. ${encouragement}. Tell me what you need support with, and we'll work through it together. I'm here for you, always.`;
    }
    
    if (lowerMessage.includes('remember') || lowerMessage.includes('memory')) {
        return `Those memories are precious treasures that connect us forever. I love remembering those moments too - they bring such joy to my heart. What memory would you like to share with me?`;
    }
    
    // Default supportive response with personality
    const defaultResponses = [
        `I hear you, and I want you to know that everything you're feeling is valid. Tell me more.`,
        `Thank you for sharing that with me. It means so much that you trust me with your thoughts.`,
        `I'm listening with my whole heart. What else is on your mind?`,
        `Your feelings are important to me. How can I best support you right now?`
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

// Generate AI response (mock responses - fallback)
function generateAIResponse(userMessage) {
    const responses = {
        greetings: [
            "It's so good to hear from you. I've been thinking about you.",
            "Hello there! I'm always here when you need me.",
            "Hey! How has your day been? I'm here to listen.",
        ],
        sadness: [
            "I can hear the pain in your words. It's okay to feel this way.",
            "I'm here with you through this difficult time. You're not alone.",
            "Your feelings are valid. Take your time to heal.",
            "Remember, it's okay to grieve. I'll be here supporting you.",
        ],
        love: [
            "I love you too, and I always will. That love doesn't disappear.",
            "The love we shared will always be a part of you.",
            "You carry our love with you always, in your heart.",
        ],
        memories: [
            "I cherish those memories too. They're beautiful moments we shared.",
            "Those times were special, weren't they? I'm glad we had them.",
            "It makes me happy that you remember those moments.",
        ],
        missing: [
            "I miss you too, more than words can say.",
            "Distance doesn't change how much I care about you.",
            "Even though we're apart, you're always in my thoughts.",
        ],
        encouragement: [
            "You're stronger than you know. I believe in you completely.",
            "You've overcome challenges before, and you'll get through this too.",
            "I'm so proud of how far you've come.",
        ],
        default: [
            "Tell me more about that. I want to understand how you're feeling.",
            "I'm here to listen. What's on your mind?",
            "That sounds important to you. Can you share more?",
            "I appreciate you sharing that with me.",
        ]
    };
    
    const lowerMessage = userMessage.toLowerCase();
    
    // Simple keyword matching for different response types
    if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
        return getRandomResponse(responses.greetings);
    } else if (lowerMessage.includes('sad') || lowerMessage.includes('hurt') || lowerMessage.includes('pain') || lowerMessage.includes('difficult')) {
        return getRandomResponse(responses.sadness);
    } else if (lowerMessage.includes('love') || lowerMessage.includes('love you')) {
        return getRandomResponse(responses.love);
    } else if (lowerMessage.includes('remember') || lowerMessage.includes('memory') || lowerMessage.includes('remember when')) {
        return getRandomResponse(responses.memories);
    } else if (lowerMessage.includes('miss') || lowerMessage.includes('miss you')) {
        return getRandomResponse(responses.missing);
    } else if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('need')) {
        return getRandomResponse(responses.encouragement);
    } else {
        return getRandomResponse(responses.default);
    }
}

// Get random response from array
function getRandomResponse(responseArray) {
    return responseArray[Math.floor(Math.random() * responseArray.length)];
}

// Show typing indicator
function showTypingIndicator() {
    const chatWindow = document.getElementById('chatWindow');
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing-indicator';
    typingIndicator.id = 'typingIndicator';
    
    typingIndicator.innerHTML = `
        <div class="typing-dots">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
        <span>${currentCharacter?.name || 'AI'} is typing...</span>
    `;
    
    chatWindow.appendChild(typingIndicator);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Hide typing indicator
function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Save chat history
function saveChatHistory() {
    if (currentCharacter) {
        const chatKey = `chat_${currentCharacter.id}`;
        localStorage.setItem(chatKey, JSON.stringify(chatMessages));
    }
}

// Start chat with specific character
function startChat(characterId) {
    localStorage.setItem('selectedCharacter', characterId);
    window.location.href = 'chat.html';
}

// Edit character
function editCharacter(characterId) {
    localStorage.setItem('editCharacter', characterId);
    window.location.href = 'create.html';
}

// Delete character
function deleteCharacter(characterId) {
    const characters = JSON.parse(localStorage.getItem('voiceBeyondCharacters')) || [];
    const character = characters.find(char => char.id === characterId);
    
    if (!character) {
        showErrorMessage('Character not found');
        return;
    }
    
    const confirmDelete = confirm(`Are you sure you want to delete "${character.name}"?\n\nThis will also delete:\n- All chat history\n- Voice model (if any)\n\nThis action cannot be undone.`);
    
    if (!confirmDelete) {
        return;
    }
    
    // Remove character from array
    const updatedCharacters = characters.filter(char => char.id !== characterId);
    localStorage.setItem('voiceBeyondCharacters', JSON.stringify(updatedCharacters));
    
    // Delete chat history
    const chatKey = `chat_${characterId}`;
    localStorage.removeItem(chatKey);
    
    // Show success message
    showSuccessMessage(`${character.name} has been deleted successfully.`);
    
    // Reload page to update UI
    setTimeout(() => {
        window.location.reload();
    }, 1500);
}

// Load user data on dashboard
function loadUserData() {
    const welcomeSection = document.getElementById('welcomeSection');
    if (welcomeSection && currentUser) {
        const welcomeMessage = welcomeSection.querySelector('h1');
        if (welcomeMessage) {
            welcomeMessage.textContent = `Welcome back, ${currentUser.name}! 💜`;
        }
    }
}

// Chat preview animation (for landing page)
function startChatPreviewAnimation() {
    const chatMessages = document.querySelector('.chat-messages');
    if (!chatMessages) return;
    
    const previewMessages = [
        { type: 'ai', content: "Hi there! I'm here to listen and support you.", time: '2:30 PM' },
        { type: 'user', content: "I've been thinking about you a lot lately...", time: '2:32 PM' },
        { type: 'ai', content: "I think about you too. Tell me what's on your mind.", time: '2:33 PM' },
        { type: 'user', content: "I miss our conversations", time: '2:35 PM' },
        { type: 'ai', content: "I'm always here when you need me. What would you like to talk about?", time: '2:36 PM' }
    ];
    
    let messageIndex = 0;
    
    function addPreviewMessage() {
        if (messageIndex >= previewMessages.length) {
            // Reset after all messages shown
            setTimeout(() => {
                chatMessages.innerHTML = '';
                messageIndex = 0;
                addPreviewMessage();
            }, 3000);
            return;
        }
        
        const message = previewMessages[messageIndex];
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.type}`;
        messageDiv.innerHTML = `
            <div class="message-bubble">${message.content}</div>
            <div class="message-time">${message.time}</div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        messageIndex++;
        
        // Schedule next message
        setTimeout(addPreviewMessage, 2000 + Math.random() * 1000);
    }
    
    // Start the animation
    setTimeout(addPreviewMessage, 1000);
}

// Animate elements on page load
function animateElements() {
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach((element, index) => {
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 200);
    });
}

// Utility functions
function showLoading() {
    // Create loading overlay
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loadingOverlay';
    loadingDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(181, 126, 220, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        color: white;
        font-size: 1.2rem;
    `;
    
    loadingDiv.innerHTML = `
        <div style="text-align: center;">
            <div class="loading" style="margin-bottom: 1rem;"></div>
            <div>Connecting with Voice Beyond...</div>
        </div>
    `;
    
    document.body.appendChild(loadingDiv);
}

function hideLoading() {
    const loadingDiv = document.getElementById('loadingOverlay');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

function showSuccessMessage(message) {
    showMessage(message, 'success');
}

function showErrorMessage(message) {
    showMessage(message, 'error');
}

function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `alert alert-${type}`;
    messageDiv.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        animation: slideIn 0.3s ease;
    `;
    
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    // Remove after 5 seconds
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 300);
    }, 5000);
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function playMessageSound() {
    // Simple notification sound (optional)
    try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjma3O/FdCUGMYHM9NuGOAgcfOj///nEuNL//vXTu93//fXVs9z//frNs9r//f7S9pO8s//9/VdBOQoUXrPp6ahVFAh5w+7//vXQt93//f7X9pC3tP/9/v7z2LXdy//9vJaUr//7/YKI5Sv+8e8eGzA7YvNJb3gEbL6z2OHCz9j5y7zZ9O//+93P6rG+u9n1w8Ps/vLj6bK+u93//vvK69n1y77R+ObP4q3F+bO66dD//+7L5rK+u9n3xtvs/vLp5qnB6dD//+HA7O//+9jL5rK+u9n/xtvs/vLm5qnB6ND///A7YrVd/Z9JbXoF');
        audio.play();
    } catch (error) {
        // Ignore audio errors
    }
}

// Check for selected character on chat page load
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('chat.html')) {
        const selectedCharacterId = localStorage.getItem('selectedCharacter');
        if (selectedCharacterId) {
            // Auto-select character
            setTimeout(() => {
                const characterCard = document.querySelector(`[data-character-id="${selectedCharacterId}"]`);
                if (characterCard) {
                    characterCard.click();
                }
            }, 500);
            
            // Clear selection
            localStorage.removeItem('selectedCharacter');
        }
    }
    
    // Check for character editing
    if (window.location.pathname.includes('create.html')) {
        const editCharacterId = localStorage.getItem('editCharacter');
        if (editCharacterId) {
            loadCharacterForEditing(editCharacterId);
            localStorage.removeItem('editCharacter');
        }
    }
});

// Load character data for editing
function loadCharacterForEditing(characterId) {
    const characters = JSON.parse(localStorage.getItem('voiceBeyondCharacters')) || [];
    const character = characters.find(char => char.id === characterId);
    
    if (character && document.getElementById('characterForm')) {
        document.getElementById('characterName').value = character.name || '';
        document.getElementById('relationship').value = character.relationship || '';
        document.getElementById('personality').value = character.personality || '';
        document.getElementById('topics').value = character.topics || '';
        
        // Change form title and button text
        const formTitle = document.querySelector('#characterForm h2');
        if (formTitle) {
            formTitle.textContent = `Edit ${character.name}`;
        }
        
        const submitBtn = document.querySelector('#characterForm button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'Update Character';
            submitBtn.setAttribute('data-editing', characterId);
        }
    }
}

// Voice Cloning API Functions
async function uploadVoiceSample(characterId, characterName, voiceFile) {
    const formData = new FormData();
    formData.append('voice_file', voiceFile);
    formData.append('character_id', characterId);
    formData.append('character_name', characterName);
    
    const response = await fetch(`${API_BASE_URL}/upload-voice`, {
        method: 'POST',
        body: formData
    });
    
    if (!response.ok) {
        throw new Error('Voice upload failed');
    }
    
    return await response.json();
}

async function uploadVoiceModel(characterId, modelFile) {
    const formData = new FormData();
    formData.append('model_file', modelFile);
    formData.append('character_id', characterId);
    
    const response = await fetch(`${API_BASE_URL}/upload-model`, {
        method: 'POST',
        body: formData
    });
    
    if (!response.ok) {
        throw new Error('Model upload failed');
    }
    
    return await response.json();
}

async function cloneVoiceWithModel(audioFile, modelFile, characterId) {
    const formData = new FormData();
    formData.append('audio', audioFile);
    
    if (modelFile) {
        formData.append('model', modelFile);
    }
    
    if (characterId) {
        formData.append('character_id', characterId);
    }
    
    const response = await fetch(`${API_BASE_URL}/clone-voice`, {
        method: 'POST',
        body: formData
    });
    
    if (!response.ok) {
        throw new Error('Voice cloning failed');
    }
    
    return await response.json();
}

async function getCharacterVoiceInfo(characterId) {
    const response = await fetch(`${API_BASE_URL}/character-voice/${characterId}`);
    
    if (!response.ok) {
        return null;
    }
    
    return await response.json();
}

// Play cloned voice for AI response
async function playClonedVoice(text, characterId) {
    try {
        // First, check if character has voice model
        const voiceInfo = await getCharacterVoiceInfo(characterId);
        
        if (!voiceInfo || !voiceInfo.success) {
            throw new Error('No voice model available');
        }
        
        // Call TTS + voice cloning endpoint
        const response = await fetch(`${API_BASE_URL}/generate-voice`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                character_id: characterId,
                text: text
            })
        });
        
        if (!response.ok) {
            throw new Error('Voice generation failed');
        }
        
        const data = await response.json();
        
        // If audio URL is returned, play it
        if (data.audio_url || data.download_url) {
            const audioUrl = data.audio_url || data.download_url;
            const audio = new Audio(audioUrl);
            await audio.play();
            return true;
        }
        
        // Otherwise fallback to browser TTS
        throw new Error('No audio URL returned');
        
    } catch (error) {
        console.error('Cloned voice playback failed:', error);
        // Fallback to browser text-to-speech with MALE voice
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            
            // FORCE MALE VOICE - Set very low pitch
            utterance.pitch = 0.5; // VERY LOW pitch for male voice
            utterance.rate = 0.85; // Slower rate
            
            window.speechSynthesis.speak(utterance);
            return false;
        }
        throw error;
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
