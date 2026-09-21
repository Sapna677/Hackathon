/**
 * CareerReady AI Floating Career Mentor Chatbot Controller
 */

function escapeHtmlChat(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatMarkdownChat(text) {
  if (!text) return '';
  let formatted = escapeHtmlChat(text);

  // Bold **text**
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Inline code `code`
  formatted = formatted.replace(/`([^`]+)`/g, '<code style="background: rgba(79, 70, 229, 0.1); color: #4338ca; padding: 0.15rem 0.35rem; border-radius: 4px; font-family: monospace; font-size: 0.85em;">$1</code>');

  // Bullet points
  formatted = formatted.replace(/(?:^|\n)[*-]\s+(.+)/g, '<div style="display: flex; gap: 0.4rem; margin: 0.25rem 0;"><span style="color: var(--primary); font-weight: bold;">•</span><span>$1</span></div>');

  // Numbered lists
  formatted = formatted.replace(/(?:^|\n)(\d+)\.\s+(.+)/g, '<div style="display: flex; gap: 0.4rem; margin: 0.25rem 0;"><strong style="color: var(--primary);">$1.</strong><span>$2</span></div>');

  // Line breaks
  formatted = formatted.replace(/\n/g, '<br/>');

  return formatted;
}

const ChatbotManager = {
  isOpen: false,
  isTyping: false,
  messages: [],

  init() {
    this.bindEvents();
    this.checkInitialGreeting();
  },

  bindEvents() {
    const launcher = document.getElementById('aiChatLauncherBtn');
    const closeBtn = document.getElementById('aiChatCloseBtn');
    const minimizeBtn = document.getElementById('aiChatMinimizeBtn');
    const clearBtn = document.getElementById('aiChatClearBtn');
    const sendBtn = document.getElementById('aiChatSendBtn');
    const input = document.getElementById('aiChatInput');

    if (launcher) {
      launcher.addEventListener('click', () => this.toggleChat());
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeChat());
    }
    if (minimizeBtn) {
      minimizeBtn.addEventListener('click', () => this.closeChat());
    }
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearChat());
    }
    if (sendBtn) {
      sendBtn.addEventListener('click', () => this.handleUserSend());
    }
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleUserSend();
        }
      });
    }

    // Bind prompt chips
    document.querySelectorAll('.ai-chat-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const text = chip.getAttribute('data-prompt') || chip.textContent.trim();
        this.sendPrompt(text);
      });
    });
  },

  toggleChat() {
    if (this.isOpen) {
      this.closeChat();
    } else {
      this.openChat();
    }
  },

  openChat() {
    const windowEl = document.getElementById('aiChatWindow');
    const launcher = document.getElementById('aiChatLauncherBtn');
    const badge = document.getElementById('aiChatUnreadBadge');

    if (windowEl) {
      windowEl.style.display = 'flex';
      // Trigger animation frame for CSS transform
      requestAnimationFrame(() => {
        windowEl.classList.add('active');
      });
    }

    if (launcher) {
      launcher.classList.add('opened');
    }
    if (badge) {
      badge.style.display = 'none';
    }
    const callout = document.getElementById('aiChatCalloutTooltip');
    if (callout) {
      callout.style.display = 'none';
    }

    this.isOpen = true;

    // Focus input field
    setTimeout(() => {
      const input = document.getElementById('aiChatInput');
      if (input) input.focus();
      this.scrollToBottom();
    }, 200);
  },

  closeChat() {
    const windowEl = document.getElementById('aiChatWindow');
    const launcher = document.getElementById('aiChatLauncherBtn');
    const callout = document.getElementById('aiChatCalloutTooltip');

    if (windowEl) {
      windowEl.classList.remove('active');
      setTimeout(() => {
        if (!this.isOpen) {
          windowEl.style.display = 'none';
        }
      }, 300);
    }

    if (launcher) {
      launcher.classList.remove('opened');
    }
    if (callout) {
      callout.style.display = 'flex';
    }

    this.isOpen = false;
  },

  checkInitialGreeting() {
    if (this.messages.length === 0) {
      this.addBotMessage(
        `👋 **Hello! Welcome to CareerReady AI Copilot!**\n\nI am your 24/7 intelligent career mentor. How can I help boost your career readiness today?`,
        [
          '📄 How to optimize my resume for ATS?',
          '🎯 How to become a Full Stack Developer?',
          '⚡ Explain Skill Gap Analysis',
          '📝 Tips for AI Quiz Assessment'
        ]
      );
    }
  },

  clearChat() {
    const container = document.getElementById('aiChatMessages');
    if (container) {
      container.innerHTML = '';
    }
    this.messages = [];
    this.checkInitialGreeting();
  },

  async handleUserSend() {
    const input = document.getElementById('aiChatInput');
    if (!input) return;

    const message = input.value.trim();
    if (!message || this.isTyping) return;

    input.value = '';
    await this.sendPrompt(message);
  },

  async sendPrompt(userText) {
    if (!userText || this.isTyping) return;

    // Open chat if currently closed
    if (!this.isOpen) {
      this.openChat();
    }

    // 1. Add User Message
    this.addUserMessage(userText);

    // 2. Show Typing Indicator
    this.showTypingIndicator();

    // 3. Prepare Context
    const user = window.Auth && window.Auth.currentUser ? window.Auth.currentUser : null;
    const context = {
      userName: user ? user.name : 'Guest',
      userRole: user ? user.role : 'Student'
    };

    // Check latest gap analysis in localStorage if available
    try {
      const savedAnalysis = localStorage.getItem('career_last_analysis');
      if (savedAnalysis) {
        const parsed = JSON.parse(savedAnalysis);
        context.targetRole = parsed.targetRole;
        context.readinessScore = parsed.readinessScore;
        context.missingSkills = (parsed.missingSkills || []).map(s => s.name || s);
      }
    } catch (e) {}

    try {
      // Call backend API
      let resData = null;
      try {
        const response = await fetch('http://localhost:5000/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(window.api && window.api.token ? { 'Authorization': `Bearer ${window.api.token}` } : {})
          },
          body: JSON.stringify({ message: userText, context })
        });
        if (response.ok) {
          resData = await response.json();
        }
      } catch (networkErr) {
        console.warn('Backend chat offline or unreachable, using smart client fallback');
      }

      // Hide Typing
      this.hideTypingIndicator();

      if (resData && resData.reply) {
        this.addBotMessage(resData.reply, resData.suggestedChips);
      } else {
        // Smart client fallback
        const fallbackReply = this.getClientFallback(userText);
        this.addBotMessage(fallbackReply.reply, fallbackReply.chips);
      }
    } catch (err) {
      this.hideTypingIndicator();
      this.addBotMessage(
        "I had a slight hiccup contacting the mentor engine, but here is a quick tip: **Upload your resume** on the Resume Analyzer tab to discover tailored skill gaps and personalized roadmaps!",
        ['Upload Resume', 'Take AI Quiz', 'View Dashboard']
      );
    }
  },

  addUserMessage(text) {
    const container = document.getElementById('aiChatMessages');
    if (!container) return;

    this.messages.push({ sender: 'user', text, time: Date.now() });

    const msgEl = document.createElement('div');
    msgEl.className = 'ai-chat-msg ai-chat-msg-user';
    msgEl.innerHTML = `
      <div class="ai-chat-bubble ai-chat-bubble-user">
        ${escapeHtmlChat(text)}
      </div>
      <div class="ai-chat-meta">Just now</div>
    `;

    container.appendChild(msgEl);
    this.scrollToBottom();
  },

  addBotMessage(markdownText, suggestedChips = []) {
    const container = document.getElementById('aiChatMessages');
    if (!container) return;

    this.messages.push({ sender: 'bot', text: markdownText, time: Date.now() });

    const msgEl = document.createElement('div');
    msgEl.className = 'ai-chat-msg ai-chat-msg-bot';
    msgEl.innerHTML = `
      <div class="ai-chat-avatar">🤖</div>
      <div class="ai-chat-bubble-wrap">
        <div class="ai-chat-bubble ai-chat-bubble-bot">
          ${formatMarkdownChat(markdownText)}
        </div>
        <div class="ai-chat-meta">AI Mentor • Just now</div>
      </div>
    `;

    container.appendChild(msgEl);
    this.updateSuggestedChips(suggestedChips);
    this.scrollToBottom();
  },

  showTypingIndicator() {
    this.isTyping = true;
    const container = document.getElementById('aiChatMessages');
    if (!container) return;

    const typingEl = document.createElement('div');
    typingEl.id = 'aiChatTyping';
    typingEl.className = 'ai-chat-msg ai-chat-msg-bot';
    typingEl.innerHTML = `
      <div class="ai-chat-avatar">🤖</div>
      <div class="ai-chat-bubble ai-chat-bubble-bot ai-typing-indicator">
        <span class="ai-typing-dot"></span>
        <span class="ai-typing-dot"></span>
        <span class="ai-typing-dot"></span>
      </div>
    `;

    container.appendChild(typingEl);
    this.scrollToBottom();
  },

  hideTypingIndicator() {
    this.isTyping = false;
    const el = document.getElementById('aiChatTyping');
    if (el) el.remove();
  },

  updateSuggestedChips(chips) {
    const container = document.getElementById('aiChatChipsContainer');
    if (!container) return;

    if (!chips || chips.length === 0) {
      container.style.display = 'none';
      return;
    }

    container.style.display = 'flex';
    container.innerHTML = chips.map(chip => `
      <button class="ai-chat-chip" data-prompt="${escapeHtmlChat(chip)}">
        ${escapeHtmlChat(chip)}
      </button>
    `).join('');

    // Re-bind click handlers
    container.querySelectorAll('.ai-chat-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = btn.getAttribute('data-prompt');
        this.sendPrompt(p);
      });
    });
  },

  scrollToBottom() {
    const container = document.getElementById('aiChatMessages');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  },

  getClientFallback(text) {
    const t = text.toLowerCase();
    if (t.includes('resume') || t.includes('cv') || t.includes('ats')) {
      return {
        reply: `**Resume Optimization Best Practices**:\n- Use quantifiable achievements (*"Boosted app rendering by 40% using React memoization"*).\n- Keep a clear, single-column ATS layout.\n- Highlight skills directly matched with your target job description.`,
        chips: ['Upload Resume now', 'Check Skill Gaps', 'Full Stack Guide']
      };
    } else if (t.includes('quiz') || t.includes('test')) {
      return {
        reply: `Our **AI Technical Assessment Quiz** provides 5 adaptive questions customized to your missing skills. You have 5 minutes to test your knowledge and raise your readiness score!`,
        chips: ['Start AI Quiz', 'How to pass React quiz?', 'Show my score']
      };
    } else if (t.includes('frontend') || t.includes('react')) {
      return {
        reply: `To excel as a **Frontend Developer**, focus on:\n1. Semantic HTML5 & Modern CSS (Grid/Flexbox)\n2. JavaScript ES6+ (Async/Await, Closures)\n3. React.js (Hooks, Context, Performance)\n4. Responsive UI & Web Vitals`,
        chips: ['React interview questions', 'Start Frontend Quiz', '4-week roadmap']
      };
    } else {
      return {
        reply: `I can help guide your career journey on **CareerReady AI**! Would you like to analyze your resume, test yourself with an AI quiz, or review your 4-week learning roadmap?`,
        chips: ['Analyze my resume', 'Take AI Quiz', 'View Skill Gaps']
      };
    }
  }
};

window.ChatbotManager = ChatbotManager;
