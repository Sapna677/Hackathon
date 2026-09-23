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
        const apiUrl = (typeof API_BASE !== 'undefined') ? `${API_BASE}/chat` : 'http://localhost:5000/api/chat';
        const response = await fetch(apiUrl, {
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
        console.warn('Backend chat offline or unreachable, using local AI answering engine');
      }

      // Hide Typing
      this.hideTypingIndicator();

      if (resData && resData.reply) {
        this.addBotMessage(resData.reply, resData.suggestedChips);
      } else {
        // Robust intelligent client-side AI answering engine
        const fallbackReply = this.getClientFallback(userText, context);
        this.addBotMessage(fallbackReply.reply, fallbackReply.chips);
      }
    } catch (err) {
      this.hideTypingIndicator();
      const fallbackReply = this.getClientFallback(userText, context);
      this.addBotMessage(fallbackReply.reply, fallbackReply.chips);
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

    if (!chips || !chips.length) {
      container.style.display = 'none';
      return;
    }

    container.style.display = 'flex';
    container.innerHTML = chips.map(chipText => `
      <button class="ai-chat-chip" data-prompt="${escapeHtmlChat(chipText)}">
        ${escapeHtmlChat(chipText)}
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

  /**
   * Comprehensive intelligent client-side answering engine
   * Answers ANY question directly with structured advice, roadmaps, and insights
   */
  getClientFallback(text, context = {}) {
    const raw = (text || '').trim();
    const t = raw.toLowerCase();

    // 1. Greetings
    if (/^(hi|hello|hey|greetings|namaste|good morning|good evening|good afternoon)\b/i.test(raw)) {
      return {
        reply: `Welcome to **CareerReady AI**! I'm your 24/7 AI Career Mentor & Technical Coach 🤖.

I can directly answer questions on:
- 🗺️ **Personalized Roadmaps** (Full-Stack, Frontend, Backend, Python, Java, DSA)
- 📄 **ATS Resume Optimization** & scoring
- 🎯 **Target Job Matching** & closing skill gaps
- 🧠 **Technical & HR Interview Preparation**
- 📝 **AI Assessment Quizzes** & skill verification

What career question, roadmap, or technical concept would you like to explore today?`,
        chips: ['Give me roadmap', 'How to optimize my resume?', 'Top Interview Questions', 'Take AI Quiz']
      };
    }

    // 2. Roadmaps (Directly answers "give me roadmap", "python roadmap", "dsa roadmap", etc.)
    if (t.includes('roadmap') || t.includes('curriculum') || t.includes('learning path') || t.includes('study plan') || t.includes('pathway') || t.includes('steps to become') || t.includes('kaise sikhe') || t.includes('roadmap chahiye')) {
      if (t.includes('frontend') || t.includes('react')) {
        return {
          reply: `Here is your **4-Week Frontend Developer Roadmap** 🚀:

- 📅 **Week 1: Core Web Standards**
  - Semantic HTML5, CSS3 (Flexbox & CSS Grid, responsive design).
  - Modern ES6+ JavaScript (Promises, Async/Await, Array Methods, Closures).
  - Git version control & GitHub workflow.
- 📅 **Week 2: React.js Architecture**
  - Component Architecture, JSX, State & Props (\`useState\`, \`useEffect\`).
  - Custom Hooks, Context API or Zustand for global state.
  - Styling with Tailwind CSS or CSS Modules.
- 📅 **Week 3: Advanced UI & API Consumption**
  - Client-side routing with React Router v6.
  - RESTful API integration, loading states, error boundaries.
- 📅 **Week 4: Performance, Testing & Deployment**
  - Lighthouse performance optimization & WCAG accessibility.
  - Unit testing with Jest & React Testing Library.
  - Deploy on Vercel/Netlify and update your ATS resume!

👉 *Tip: Generate a personalized timeline on our **⚡ Skill Gap & Roadmap** tab!*`,
          chips: ['React interview questions', 'Full Stack Roadmap', 'Take Frontend Quiz']
        };
      }

      if (t.includes('backend') || t.includes('node')) {
        return {
          reply: `Here is your **4-Week Backend Developer Roadmap** ⚙️:

- 📅 **Week 1: Server Architecture & APIs**
  - Node.js runtime, Event Loop, asynchronous non-blocking I/O.
  - Express.js or Fastify server setup, middleware pipeline, routing, CORS.
  - RESTful API design conventions & standard HTTP status codes.
- 📅 **Week 2: Databases & Persistence**
  - Relational (PostgreSQL/MySQL): Schema design, indexing, foreign keys.
  - NoSQL (MongoDB): Mongoose schemas, aggregations.
- 📅 **Week 3: Authentication & Security**
  - JWT (JSON Web Tokens) stateless auth, refresh tokens, \`bcryptjs\` password hashing.
  - Input validation, rate limiting, and Redis caching.
- 📅 **Week 4: DevOps, Testing & Cloud**
  - Automated testing with Jest & Supertest.
  - Docker containerization (Dockerfile & Docker Compose).
  - Deploy on Render or AWS with CI/CD pipelines.

👉 *Tip: Validate your backend competencies on our **📝 AI Quiz** tab!*`,
          chips: ['MongoDB vs PostgreSQL', 'Express security tips', 'Take Backend Quiz']
        };
      }

      if (t.includes('python') || t.includes('data science') || t.includes('ai') || t.includes('ml')) {
        return {
          reply: `Here is your **4-Week Python & AI Roadmap** 🐍:

- 📅 **Week 1: Python Core & OOP**
  - Python syntax, Collections (Lists, Dicts, Tuples, Sets), List Comprehensions.
  - Object-Oriented Programming (Classes, Inheritance, Dunder methods).
- 📅 **Week 2: Data Manipulation & Analysis**
  - **NumPy**: Vectorized math, arrays.
  - **Pandas**: DataFrames, data cleaning, aggregation.
  - Data visualization with Matplotlib & Seaborn.
- 📅 **Week 3: High-Speed Web APIs**
  - Build REST APIs using **FastAPI** or Flask with Pydantic validation.
  - Integrate AI SDKs (OpenAI / Gemini / LangChain).
- 📅 **Week 4: Machine Learning & Deployment**
  - Scikit-Learn: Classification, Regression, Model Evaluation.
  - Deploy interactive prototypes on Streamlit Cloud or Render.`,
          chips: ['Python interview questions', 'AI project ideas', 'Take AI Quiz']
        };
      }

      if (t.includes('dsa') || t.includes('algorithm') || t.includes('leetcode')) {
        return {
          reply: `Here is your **4-Week DSA (Data Structures & Algorithms) Roadmap** 🧠:

- 📅 **Week 1: Arrays, Strings & Two Pointers**
  - In-place transformations, Prefix Sums, Kadane's Algorithm.
  - Hash Maps for $O(1)$ lookups, frequency counting.
  - Two Pointers & Sliding Window patterns (solve 20 problems).
- 📅 **Week 2: Linked Lists, Stacks & Queues**
  - Fast & slow pointer cycle detection, linked list reversal.
  - Monotonic stacks, Valid Parentheses, Queues.
- 📅 **Week 3: Trees, Heaps & Graphs**
  - Binary Trees & BST: Inorder/Preorder/Postorder traversals.
  - Min/Max Heaps for Top-K element queries.
  - Graph traversals: BFS & DFS.
- 📅 **Week 4: Dynamic Programming & Interview Sets**
  - 1D & 2D Dynamic Programming (Knapsack, Subsequences).
  - Target the **Blind 75 / NeetCode 150** problem sets on LeetCode!`,
          chips: ['Top DSA patterns', 'How to solve DP?', 'Practice AI Quiz']
        };
      }

      // Default Comprehensive Full-Stack Roadmap
      return {
        reply: `Here is your **4-Week Full-Stack Web Development Roadmap** 🚀:

- 📅 **Week 1: Frontend Foundations & Responsive Design**
  - Semantic HTML5, modern CSS3 (Flexbox & CSS Grid), and modern JavaScript (ES6+, Promises, Async/Await).
  - Git version control and GitHub branch management.
- 📅 **Week 2: React.js & Dynamic State Management**
  - Component architecture, Hooks (\`useState\`, \`useEffect\`, \`useMemo\`, \`useCallback\`).
  - Client-side routing and REST API data fetching with Axios/Fetch.
- 📅 **Week 3: Backend APIs & Database Modeling**
  - Build Node.js + Express.js REST APIs with structured MVC patterns.
  - Connect with MongoDB or PostgreSQL; implement JWT authentication & secure password hashing.
- 📅 **Week 4: Full-Stack Integration, Testing & Deployment**
  - Connect frontend with backend, handle loading states and error boundaries.
  - Containerize with Docker and deploy live on Render/Vercel.
  - Update your ATS resume with your new deployed application!

👉 *To get a personalized roadmap based on your exact resume and target role, open the **⚡ Skill Gap & Roadmap** tab!*`,
        chips: ['Frontend Roadmap', 'Backend Roadmap', 'Python Roadmap', 'DSA Roadmap']
      };
    }

    // 3. Resume & ATS Optimization
    if (t.includes('resume') || t.includes('cv') || t.includes('ats') || t.includes('bullet') || t.includes('formatting')) {
      return {
        reply: `Here are **5 Proven Rules to Optimize Your Tech Resume for ATS** 📄:

1. **The Google XYZ Formula for Bullet Points**:
   - ❌ *Weak*: "Built a React website for an e-commerce store."
   - ✅ *Strong*: *"Engineered a responsive React e-commerce application with Redux, decreasing page load latency by 38% for 1,500+ active users."*
2. **Clean Single-Column Layout**:
   - Avoid multi-column tables, text boxes, or graphics. ATS parsers read sequentially and get confused by column layouts.
3. **Structured Technical Skills Section**:
   - Categorize cleanly into *Languages, Frameworks, Databases, Tools & Platforms*. Avoid vague skill percentage bars.
4. **Clickable Verification Links**:
   - Include direct live deployment URLs and clean GitHub repositories with documented READMEs.
5. **Direct Role Keyword Alignment**:
   - Match your technical keywords directly with the target Job Description.

👉 *Upload your resume right now on our **📄 Upload Resume** tab to view your automated ATS score!*`,
        chips: ['Upload Resume now', 'Match with Job Description', 'Top Bullet Action Verbs']
      };
    }

    // 4. Interview Preparation & Practice
    if (t.includes('interview') || t.includes('technical round') || t.includes('hr round') || t.includes('mock interview') || t.includes('star method') || t.includes('behavioral')) {
      return {
        reply: `Here is your **Complete Tech Interview Preparation Strategy** 🎯:

1. **Technical Coding Rounds**:
   - **Think Aloud**: Explain your reasoning, tradeoffs, and assumptions before writing code.
   - **Clarify Edge Cases**: Ask about empty inputs, duplicates, or negative constraints upfront.
   - **Start with Brute Force**: State the naive solution and its $O(N^2)$ complexity, then optimize to $O(N)$ or $O(N \\log N)$.
   - **Dry Run**: Walk through sample inputs manually to catch boundary bugs.

2. **Behavioral / HR Round (The STAR Method)**:
   - **S (Situation)**: Describe the project context.
   - **T (Task)**: What goal or challenge needed solving?
   - **A (Action)**: What specific steps did YOU execute?
   - **R (Result)**: Quantify the outcome (e.g. *"Reduced query latency by 45%"*).

👉 *Practice timed technical questions right now on the **📝 AI Quiz** tab!*`,
        chips: ['Take 5-min AI Quiz', 'Top React interview questions', 'How to answer STAR questions?']
      };
    }

    // 5. Internships & Freshers Placement
    if (t.includes('internship') || t.includes('job') || t.includes('fresher') || t.includes('placement') || t.includes('campus placement') || t.includes('naukri') || t.includes('apply')) {
      return {
        reply: `Here is the **Proven Step-by-Step Playbook for Landing Tech Jobs & Internships** 💼:

1. **Build 2 Production-Grade Projects**:
   - Avoid generic tutorial clones. Build full-stack apps with authentication, database persistence, and clean UI.
   - Include live demo links and documented GitHub repos.
2. **Targeted LinkedIn Outreach**:
   - Find Engineering Managers or Founders and send a polite, concise 3-line message:
     > *"Hi [Name], I noticed your team is building with React & Node.js. I recently built [Project with Link] solving [Problem]. I would love to contribute as an intern/junior developer. Here is my resume."*
3. **Alumni Networking**:
   - Connect with college alumni working at your target companies and politely ask for guidance or referral.
4. **Regular Timed Practice**:
   - Take weekly technical quizzes on our **📝 AI Quiz** tab to keep your problem-solving sharp for online assessment rounds.`,
        chips: ['How to optimize my resume?', 'Project ideas for resume', 'Take AI Quiz']
      };
    }

    // 6. Project & Portfolio Ideas
    if (t.includes('project') || t.includes('portfolio') || t.includes('what to build')) {
      return {
        reply: `Here are **3 High-Impact Portfolio Project Ideas** that recruiters love 💡:

1. **AI-Powered SaaS Application** (Highest Value):
   - Example: Document / Resume Analyzer or AI Study Copilot.
   - Tech: React / Next.js, Node.js, Express, MongoDB/PostgreSQL, Gemini/OpenAI API.
   - Features: File upload, automated text extraction, vector search, dark mode, Stripe billing.
2. **Real-Time Collaboration Platform**:
   - Example: Collaborative Whiteboard, Code Editor, or Team Chat.
   - Tech: React, Node.js, Socket.io / WebSockets, Redis pub/sub.
   - Features: Real-time room sync, presence indicators, message history.
3. **E-Commerce / Marketplace with Payment Gateway**:
   - Example: Digital goods or booking platform.
   - Tech: MERN stack or PostgreSQL with Prisma.
   - Features: Search & filter, cart management, Razorpay/Stripe checkout, order tracking.

👉 *Deploy these on Vercel/Render and feature them at the top of your resume!*`,
        chips: ['How to describe projects on resume?', 'Full Stack Roadmap', 'Analyze my resume']
      };
    }

    // 7. Tech Concepts ("what is ...", "difference between ...")
    if (t.includes('what is') || t.includes('explain') || t.includes('difference between') || t.includes('kya hai') || t.includes('vs')) {
      if (t.includes('react')) {
        return {
          reply: `**What is React.js?** ⚛️
- React is a declarative, component-based JavaScript library developed by Meta for building dynamic user interfaces.
- **Key Concepts**:
  - **Component-Driven**: UI is broken down into reusable, self-contained functional blocks.
  - **Virtual DOM**: Instead of updating the real browser DOM directly, React creates a lightweight virtual tree, calculates diffs, and batches updates efficiently.
  - **Hooks**: Built-in functions like \`useState\` (state management), \`useEffect\` (side effects), and \`useMemo\` (performance caching).
  - **One-Way Data Flow**: Data flows unidirectionally from parent to child via props.`,
          chips: ['React interview questions', 'Frontend Roadmap', 'Take React Quiz']
        };
      }
      if (t.includes('api') || t.includes('rest')) {
        return {
          reply: `**What is an API / RESTful API?** 🌐
- An **API (Application Programming Interface)** enables different software systems to communicate with each other.
- **REST (Representational State Transfer)** is an architectural standard using HTTP methods:
  - **GET**: Retrieve data (e.g. \`/api/users\`).
  - **POST**: Create a new resource (e.g. \`/api/login\`).
  - **PUT / PATCH**: Update existing resources.
  - **DELETE**: Remove a resource.
- **Core Principles**: Statelessness (each request contains all needed info), standard JSON payload format, and proper HTTP response codes (200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 500 Server Error).`,
          chips: ['Backend Developer Roadmap', 'Node.js vs Express', 'Take Backend Quiz']
        };
      }
      if (t.includes('sql') || t.includes('nosql') || t.includes('database')) {
        return {
          reply: `**SQL vs NoSQL Databases** 🗄️:

| Feature | SQL (PostgreSQL, MySQL) | NoSQL (MongoDB, Redis) |
| :--- | :--- | :--- |
| **Structure** | Rigid tables with rows & columns | Flexible JSON-like documents or key-value |
| **Schema** | Strictly defined upfront with schemas | Dynamic, flexible schema |
| **Relationships** | Foreign keys & JOIN operations | Embedded documents or references |
| **Scaling** | Vertical (more RAM/CPU) | Horizontal (distributed clusters) |
| **Best Used For** | FinTech, E-Commerce, transactional data | Fast prototyping, real-time analytics, big data |`,
          chips: ['Backend Roadmap', 'MongoDB tips', 'Take Backend Quiz']
        };
      }
      if (t.includes('docker')) {
        return {
          reply: `**What is Docker?** 🐳
- Docker packages your code, runtime, system tools, and libraries into a standardized unit called a **Container**.
- **Why it matters**: Eliminates the classic *"It works on my machine!"* problem by guaranteeing identical environments across development, testing, and cloud production.
- **Core Terms**:
  - **Dockerfile**: Blueprint instructions to build your image.
  - **Docker Image**: The compiled snapshot containing the app and dependencies.
  - **Docker Container**: A live running instance of the image.`,
          chips: ['DevOps Roadmap', 'Backend Developer guide', 'Take AI Quiz']
        };
      }
      if (t.includes('jwt') || t.includes('token') || t.includes('auth')) {
        return {
          reply: `**What is JWT (JSON Web Token)?** 🔐
- JWT is a compact, URL-safe standard for securely transmitting verified claims between two parties.
- **Three Parts**:
  1. **Header**: Algorithm & token type (e.g. HMAC SHA256).
  2. **Payload**: Encoded user data (e.g. \`userId\`, \`role\`, \`exp\` timestamp).
  3. **Signature**: Cryptographic signature generated with your secret key to prevent tampering.
- **How it works**: Client logs in -> Server issues JWT -> Client attaches \`Authorization: Bearer <token>\` to subsequent API requests.`,
          chips: ['Express.js security tips', 'Backend Roadmap', 'Take Backend Quiz']
        };
      }
      if (t.includes('ats')) {
        return {
          reply: `**What is an ATS (Applicant Tracking System)?** 🤖
- An **ATS** is automated software used by 95%+ of tech companies (Workday, Greenhouse, Lever, Taleo) to scan, filter, and rank resumes before a human recruiter ever sees them.
- **How ATS algorithms rank your resume**:
  - They parse your text into structured fields (Name, Skills, Experience, Education).
  - They compute a **keyword match percentage** against the target Job Description.
  - If formatting has complex columns, tables, or non-standard fonts, the parser fails and assigns a low ranking!

👉 *Check your resume match percentage on our **📄 Upload Resume** tab!*`,
          chips: ['Upload Resume now', 'Resume tips', 'Match with Job Description']
        };
      }
    }

    // 8. Hinglish Questions ("kaise", "kya", "chahiye", "batao", "sikhna", "job kaise milegi")
    if (t.includes('kaise') || t.includes('kya') || t.includes('chahiye') || t.includes('batao') || t.includes('sikhna') || t.includes('madad') || t.includes('karna hai')) {
      return {
        reply: `Bilkul! Main aapki career preparation mein poori madad karunga 🚀:

Aapko step-by-step kya karna chahiye:
1. 📄 **Resume Upload Karein**: Sabse pehle **📄 Upload Resume** tab par jaakar apna resume upload karein taaki platform aapke verified skills aur missing skills extract kar sake.
2. 🎯 **Target Job Match Karein**: **🎯 Job Description** tab mein apni dream company ki JD paste karke apna ATS Match % check karein.
3. ⚡ **4-Week Roadmap Follow Karein**: **⚡ Skill Gap & Roadmap** tab par aapko week-by-week structured modules milenge jinhe follow karke aap missing skills jaldi cover kar sakte hain.
4. 📝 **AI Quizzes Practice Karein**: Apni skills verify karne ke liye **📝 AI Quiz** tab par 5-minute timed quizzes dein aur apna readiness score 80%+ tak le jayein!

Aapko specific kis topic (e.g. *Full Stack*, *Frontend*, *Backend*, *Python*, ya *Interview Tips*) par guidance chahiye?`,
        chips: ['Full Stack Roadmap', 'Resume kaise banaye?', 'Interview tips do', 'Take AI Quiz']
      };
    }

    // 9. Dynamic Universal Answer (Answers ANY freeform question directly)
    const cleanTopic = raw.replace(/[?.,!]/g, '').trim();
    return {
      reply: `That's a great question regarding **${cleanTopic || 'tech career readiness'}**! 🎯

Here is actionable guidance to approach this effectively:

1. **Understand Core Competencies**:
   - High-growth engineering roles prioritize hands-on problem-solving, structured architecture, and clear code documentation over memorization.
2. **Follow a Guided Step-by-Step Plan**:
   - Master one technology stack at a time. You can generate an organized week-by-week plan on our **⚡ Skill Gap & Roadmap** tab.
3. **Build & Deploy Proof-of-Work**:
   - Don't just watch tutorials—build interactive projects that demonstrate your ability to write clean, tested code and integrate APIs.
4. **Validate Through Testing**:
   - Practice under timed conditions on our **📝 AI Quiz** tab to verify your mastery and boost your Overall Career Readiness Score.

Would you like me to generate a specific roadmap or share interview questions for this topic?`,
      chips: ['Give me 4-week roadmap', 'How to optimize my resume?', 'Take 5-min AI Quiz', 'View Skill Gaps']
    };
  }
};

window.ChatbotManager = ChatbotManager;
