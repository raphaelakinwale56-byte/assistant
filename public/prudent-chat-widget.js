(function() {
  // Detect the script's base URL
  const scriptTag = document.currentScript;
  const scriptSrc = scriptTag ? scriptTag.src : '';
  let apiBase = window.location.origin;
  
  if (scriptSrc && scriptSrc.startsWith('http')) {
    try {
      apiBase = new URL(scriptSrc).origin;
    } catch (e) {
      console.error("Prudent Widget: Failed to parse script source URL", e);
    }
  }
  
  console.log("Prudent Widget: Initializing with API Base:", apiBase);

  function init() {
    if (!document.body) {
      console.log("Prudent Widget: Body not ready, retrying...");
      setTimeout(init, 100);
      return;
    }

    const CONFIG = {
      apiBase: apiBase,
      businessName: "Prudent Homecare",
      assistantName: "Digital Care Assistant",
      phone: "+1 701-319-2659",
      welcomeMessage: "Hello 👋 I'm your Digital Care Assistant. How can I support you today?",
      quickReplies: [
        "Our Services",
        "Smart Assessment",
        "Speak to a Coordinator",
        "Request a Consultation"
      ]
    };

    let chatHistory = JSON.parse(localStorage.getItem('prudent_chat_history')) || [];
    let isWindowOpen = false;
    let unreadCount = 0;

    // Inject Styles
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${CONFIG.apiBase}/widget/widget-styles.css`;
    document.head.appendChild(link);

    // Create Widget Container
    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'prudent-chat-widget';
    document.body.appendChild(widgetContainer);

    // Initial HTML
    widgetContainer.innerHTML = `
      <div class="prudent-welcome-bubble" id="prudent-bubble">
        How can I help you today?
      </div>
      <div class="prudent-resume-btn" id="prudent-resume">
        Resume Consultation
      </div>
      <div class="prudent-chat-button" id="prudent-toggle">
        <div class="prudent-unread-badge" id="prudent-badge">0</div>
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
      </div>
      <div class="prudent-chat-window" id="prudent-window">
        <div class="prudent-chat-header">
          <div class="prudent-chat-header-info">
            <h3>${CONFIG.assistantName}</h3>
            <div class="prudent-status-wrapper">
              <div class="prudent-status-dot"></div>
              <span class="prudent-status-text">Online & Ready</span>
            </div>
          </div>
          <div class="prudent-header-actions">
            <a href="https://prudenthomecarend.com/" target="_blank" class="prudent-go-main">Go to Main</a>
            <div class="prudent-chat-close" id="prudent-close">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </div>
          </div>
        </div>
        <div class="prudent-chat-messages" id="prudent-messages"></div>
        <div class="prudent-typing" id="prudent-typing">Assistant is thinking...</div>
        <div class="prudent-chat-quick-replies" id="prudent-quick-replies"></div>
        <div class="prudent-chat-input-area" id="prudent-input-area">
          <input type="text" class="prudent-chat-input" id="prudent-input" placeholder="How can we help?">
          <button class="prudent-chat-send" id="prudent-send">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </div>
      </div>
    `;

    const toggleBtn = document.getElementById('prudent-toggle');
    const closeBtn = document.getElementById('prudent-close');
    const resumeBtn = document.getElementById('prudent-resume');
    const chatWindow = document.getElementById('prudent-window');
    const messagesContainer = document.getElementById('prudent-messages');
    const quickRepliesContainer = document.getElementById('prudent-quick-replies');
    const inputField = document.getElementById('prudent-input');
    const sendBtn = document.getElementById('prudent-send');
    const typingIndicator = document.getElementById('prudent-typing');
    const welcomeBubble = document.getElementById('prudent-bubble');
    const unreadBadge = document.getElementById('prudent-badge');

    let isRegistering = false;
    let registrationStep = 0;
    let registrationData = {};

    // Toggle Window
    function toggleWindow(open) {
      isWindowOpen = open !== undefined ? open : !isWindowOpen;
      chatWindow.classList.toggle('active', isWindowOpen);
      welcomeBubble.classList.remove('active');
      
      // Handle Resume Button Visibility
      if (isWindowOpen) {
        resumeBtn.classList.remove('active');
      } else if (chatHistory.length > 0) {
        resumeBtn.classList.add('active');
      }

      if (isWindowOpen) {
        unreadCount = 0;
        updateBadge();
        if (messagesContainer.children.length === 0) {
          if (chatHistory.length > 0) {
            loadHistory();
          } else {
            addMessage(CONFIG.welcomeMessage, 'bot');
          }
          renderQuickReplies();
        }
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }

    toggleBtn.onclick = () => toggleWindow();
    closeBtn.onclick = () => toggleWindow(false);
    resumeBtn.onclick = () => toggleWindow(true);
    welcomeBubble.onclick = () => toggleWindow(true);

    // Public API for external buttons
    window.prudentWidget = {
      open: () => toggleWindow(true),
      close: () => toggleWindow(false)
    };

    // Auto-open/show bubble after delay
    setTimeout(() => {
      if (!isWindowOpen && chatHistory.length === 0) {
        console.log("Prudent Widget: Showing welcome bubble");
        welcomeBubble.classList.add('active');
      }
    }, 1000);

    function updateBadge() {
      unreadBadge.textContent = unreadCount;
      unreadBadge.classList.toggle('active', unreadCount > 0);
    }

    function saveHistory() {
      localStorage.setItem('prudent_chat_history', JSON.stringify(chatHistory));
    }

    function loadHistory() {
      chatHistory.forEach(msg => {
        const sender = msg.role === 'model' ? 'bot' : 'user';
        const text = msg.parts[0].text;
        const msgDiv = document.createElement('div');
        msgDiv.className = `prudent-message ${sender}`;
        msgDiv.textContent = text;
        messagesContainer.appendChild(msgDiv);
      });
    }

    // Add Message to UI
    function addMessage(text, sender) {
      const msgDiv = document.createElement('div');
      msgDiv.className = `prudent-message ${sender}`;
      msgDiv.textContent = text;
      messagesContainer.appendChild(msgDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      
      if (sender !== 'system') {
        chatHistory.push({
          role: sender === 'bot' ? 'model' : 'user',
          parts: [{ text: text }]
        });
        saveHistory();
      }

      if (!isWindowOpen && sender === 'bot') {
        unreadCount++;
        updateBadge();
      }
    }

    // Render Quick Replies
    function renderQuickReplies(customReplies) {
      const replies = customReplies || CONFIG.quickReplies;
      quickRepliesContainer.innerHTML = '';
      replies.forEach(reply => {
        const btn = document.createElement('button');
        btn.className = 'prudent-quick-reply';
        btn.textContent = reply;
        btn.onclick = () => {
          if (reply === "Smart Assessment" || reply === "Open Assessment Tool") {
            window.postMessage({ type: 'OPEN_ASSESSMENT' }, '*');
            addMessage("I've opened our Smart Care Assessment tool for you. You can also continue our conversation here if you prefer.", 'bot');
          } else if (reply === "Continue Here") {
            startConversationalRegistration();
          } else {
            handleUserInput(reply);
          }
        };
        quickRepliesContainer.appendChild(btn);
      });
    }

    // Handle User Input
    async function handleUserInput(text) {
      if (!text.trim()) return;
      
      addMessage(text, 'user');
      inputField.value = '';

      if (isRegistering) {
        handleRegistrationStep(text);
        return;
      }
      
      // Check for registration/assessment triggers
      const regTriggers = ['register', 'sign up', 'intake', 'enroll', 'start registration', 'assessment', 'evaluation'];
      if (regTriggers.some(t => text.toLowerCase().includes(t))) {
        addMessage("I can help you with that. Would you like to use our Smart Care Assessment tool for a detailed evaluation, or should we start a quick registration right here?", 'bot');
        renderQuickReplies(["Open Assessment Tool", "Continue Here"]);
        return;
      }

      typingIndicator.classList.add('active');
      
      try {
        if (typeof window.prudentChat !== 'function') {
          throw new Error("Chat handler not ready. Please try again in a moment.");
        }

        const responseText = await window.prudentChat(text, chatHistory.slice(0, -1));
        typingIndicator.classList.remove('active');
        
        if (responseText) {
          addMessage(responseText, 'bot');
        } else {
          addMessage("I'm here to help. How can I assist you today?", 'bot');
        }
      } catch (error) {
        console.error("Chat Error:", error);
        typingIndicator.classList.remove('active');
        addMessage("I'm sorry, I'm having trouble connecting. Please call us at " + CONFIG.phone, 'bot');
      }
    }

    // Conversational Registration
    function startConversationalRegistration() {
      isRegistering = true;
      registrationStep = 1;
      registrationData = {};
      addMessage("Let's get started. What is the full name of the person needing care?", 'bot');
      renderQuickReplies([]);
    }

    async function handleRegistrationStep(text) {
      switch(registrationStep) {
        case 1:
          registrationData.name = text;
          registrationStep = 2;
          addMessage(`Thank you, ${text}. What is the best phone number to reach you?`, 'bot');
          break;
        case 2:
          registrationData.phone = text;
          registrationStep = 3;
          addMessage("What type of care are you looking for? (Personal care, companionship, medication support, etc.)", 'bot');
          renderQuickReplies(["Personal Care", "Companionship", "Medication Support", "Transportation"]);
          break;
        case 3:
          registrationData.type = text;
          registrationStep = 4;
          addMessage("Lastly, is there anything specific we should know about the situation?", 'bot');
          renderQuickReplies(["No, that's all", "I'll type more"]);
          break;
        case 4:
          registrationData.message = text;
          isRegistering = false;
          typingIndicator.classList.add('active');
          try {
            const fullMessage = `CONVERSATIONAL INTAKE: ${registrationData.type}. Details: ${registrationData.message}`;
            await fetch(`${CONFIG.apiBase}/api/leads`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                name: registrationData.name, 
                phone: registrationData.phone, 
                email: 'conversational@chat.widget', 
                message: fullMessage 
              })
            });
            typingIndicator.classList.remove('active');
            addMessage("Thank you. I've sent your information to our care coordination team. Someone will be in touch with you shortly.", 'bot');
          } catch (error) {
            typingIndicator.classList.remove('active');
            addMessage("I'm sorry, I had trouble saving that. Please call us at " + CONFIG.phone + " so we can help you directly.", 'bot');
          }
          renderQuickReplies();
          break;
      }
    }

    // Event Listeners
    sendBtn.onclick = () => handleUserInput(inputField.value);
    inputField.onkeypress = (e) => {
      if (e.key === 'Enter') handleUserInput(inputField.value);
    };

  }

  init();

})();
