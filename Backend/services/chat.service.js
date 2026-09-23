/**
 * AI Career Mentor & Copilot Conversational Service
 * Handles career guidance, resume suggestions, skill gap explanations,
 * technical interview prep, and platform navigation.
 */

const https = require('https');

// Comprehensive Knowledge Base covering all key career domains
const KNOWLEDGE_BASE = {
  roadmap: {
    keywords: ['roadmap', 'curriculum', 'learning path', 'study plan', 'pathway', 'steps to become', 'how to start', 'kaise sikhe', 'roadmap chahiye', 'guide me'],
    handler: (msg, context) => {
      const lower = msg.toLowerCase();
      let role = 'Full-Stack Developer';
      if (lower.includes('frontend') || lower.includes('react')) role = 'Frontend Developer';
      else if (lower.includes('backend') || lower.includes('node')) role = 'Backend Developer';
      else if (lower.includes('python') || lower.includes('data science') || lower.includes('ai') || lower.includes('ml')) role = 'Python & AI Engineer';
      else if (lower.includes('java') || lower.includes('spring')) role = 'Java & Spring Boot Developer';
      else if (lower.includes('dsa') || lower.includes('algorithm') || lower.includes('leetcode')) role = 'DSA & Problem Solving';

      if (role === 'Frontend Developer') {
        return {
          reply: `Here is your **4-Week Intensive Frontend Developer Roadmap** 🚀:

- 📅 **Week 1: Core Fundamentals**
  - Semantic HTML5, Modern CSS3 (Flexbox & CSS Grid, responsive media queries).
  - Modern ES6+ JavaScript: Promises, Async/Await, Array methods (\`map\`, \`filter\`, \`reduce\`), Closures.
  - Git version control & GitHub repo hosting.
- 📅 **Week 2: React.js Architecture**
  - Components, JSX, Props, and State (\`useState\`, \`useEffect\`).
  - Custom Hooks, Context API or Zustand for global state.
  - Modern styling: Tailwind CSS or CSS Modules.
- 📅 **Week 3: Advanced UI & APIs**
  - Client-side routing with React Router.
  - RESTful API consumption, error handling, loading states, and React Query/Axios.
  - Form handling and validation.
- 📅 **Week 4: Performance, Testing & Portfolio Deployment**
  - Lighthouse performance, Web Vitals, and WCAG accessibility standards.
  - Unit testing with Jest & React Testing Library.
  - Deploy 2 standout projects on Vercel/Netlify and update your ATS resume!

👉 *Tip: Head over to our **⚡ Skill Gap & Roadmap** tab to generate your personalized timeline!*`,
          suggestedChips: ['React interview questions', 'How to optimize frontend?', 'Take Frontend Quiz']
        };
      }

      if (role === 'Backend Developer') {
        return {
          reply: `Here is your **4-Week Intensive Backend Developer Roadmap** ⚙️:

- 📅 **Week 1: Server Fundamentals & API Design**
  - Node.js runtime, Event Loop, asynchronous non-blocking I/O.
  - Express.js or Fastify server setup, middleware architecture, routing, and CORS.
  - RESTful API best practices and standardized HTTP status codes.
- 📅 **Week 2: Databases & Data Modeling**
  - Relational databases (PostgreSQL/MySQL): Schema design, indexing, joins, migrations.
  - NoSQL (MongoDB): Mongoose schemas, aggregations, flexible document modeling.
  - CRUD operations with proper validation.
- 📅 **Week 3: Authentication & Security**
  - JWT (JSON Web Tokens) stateless auth and Refresh token rotation.
  - Password hashing with \`bcryptjs\`, rate limiting, and input sanitization.
  - Caching with Redis to boost query speeds.
- 📅 **Week 4: DevOps, Testing & Cloud Deployment**
  - Automated testing with Jest, Supertest, and Postman API test suites.
  - Docker containerization (Dockerfile & Docker Compose).
  - Deploy on Render, Railway, or AWS EC2 with continuous integration (GitHub Actions).

👉 *Tip: Validate your backend knowledge using our **📝 AI Quiz** tab!*`,
          suggestedChips: ['MongoDB vs PostgreSQL', 'Express security tips', 'Take Backend Quiz']
        };
      }

      if (role === 'Python & AI Engineer') {
        return {
          reply: `Here is your **4-Week Python & AI Career Roadmap** 🐍:

- 📅 **Week 1: Python Core & OOP**
  - Python syntax, data structures (Lists, Dicts, Tuples, Sets), list comprehensions.
  - Object-Oriented Programming (Classes, Inheritance, Dunder methods).
  - File I/O, exception handling, and virtual environments (\`venv\`).
- 📅 **Week 2: Data Handling & Scientific Computing**
  - **NumPy**: Vectorized operations, multidimensional arrays.
  - **Pandas**: DataFrames, data cleaning, aggregation, exploratory data analysis.
  - Visualization: Matplotlib & Seaborn charts.
- 📅 **Week 3: APIs & Web Integration**
  - Build high-speed REST APIs using **FastAPI** or Flask with Pydantic schemas.
  - Integrate AI models, OpenAI/Gemini SDKs, or LangChain.
- 📅 **Week 4: Machine Learning & Capstone Deployment**
  - Scikit-Learn pipelines: Classification, Regression, evaluation metrics (Accuracy, F1).
  - Deploy an interactive app on Streamlit Cloud or Render.`,
          suggestedChips: ['FastAPI vs Flask', 'Python interview questions', 'AI project ideas']
        };
      }

      if (role === 'Java & Spring Boot Developer') {
        return {
          reply: `Here is your **4-Week Java & Spring Boot Roadmap** ☕:

- 📅 **Week 1: Core Java Mastery**
  - OOP Principles (Encapsulation, Polymorphism, Abstraction, Inheritance).
  - Java Collections Framework (ArrayList, HashMap, HashSet, LinkedList).
  - Java 8+ features: Streams API, Lambdas, Optional, Concurrency basics.
- 📅 **Week 2: Spring Framework & Spring Boot**
  - Inversion of Control (IoC) & Dependency Injection (\`@Autowired\`, \`@Component\`, \`@Service\`).
  - Building RESTful Web Services with \`@RestController\`, \`@GetMapping\`, \`@PostMapping\`.
- 📅 **Week 3: Data Persistence with Spring Data JPA**
  - Hibernate ORM, Entity mapping (\`@OneToMany\`, \`@ManyToOne\`), JpaRepository.
  - Connecting with PostgreSQL/MySQL and executing custom JPQL queries.
- 📅 **Week 4: Security, Microservices & Deployment**
  - Spring Security with JWT token-based authentication.
  - Microservices fundamentals, Docker containerization, and JUnit 5/Mockito unit tests.`,
          suggestedChips: ['Spring Boot interview questions', 'Java Collections guide', 'Take Java Quiz']
        };
      }

      if (role === 'DSA & Problem Solving') {
        return {
          reply: `Here is your **4-Week DSA (Data Structures & Algorithms) Mastery Roadmap** 🧠:

- 📅 **Week 1: Linear Data Structures & Two Pointers**
  - Arrays & Strings: In-place manipulation, Kadane's Algorithm, Prefix Sums.
  - Hash Maps & Sets: $O(1)$ lookups, frequency counting.
  - Two Pointers & Sliding Window techniques (solve 20 problems).
- 📅 **Week 2: Stacks, Queues & Linked Lists**
  - Singly & Doubly Linked Lists: Reversal, fast & slow pointer cycle detection.
  - Stacks: Monotonic stack, Valid Parentheses.
  - Queues & Deque implementations.
- 📅 **Week 3: Trees, Heaps & Graphs**
  - Binary Trees & BST: Inorder/Preorder/Postorder traversals, Lowest Common Ancestor.
  - Priority Queues (Min/Max Heap) for Top-K frequent elements.
  - Graphs: BFS, DFS, Dijkstra's algorithm, cycle detection.
- 📅 **Week 4: Dynamic Programming & Interview Patterns**
  - Recursion & Backtracking (Subsets, Permutations).
  - 1D & 2D Dynamic Programming (0/1 Knapsack, Longest Common Subsequence).
  - Target the **Blind 75 / NeetCode 150** problem sets on LeetCode!`,
          suggestedChips: ['Top 10 DSA interview patterns', 'How to solve DP?', 'Practice AI Quiz']
        };
      }

      // Default Full-Stack Roadmap
      return {
        reply: `Here is your comprehensive **4-Week Full-Stack Web Development Roadmap** 🚀:

- 📅 **Week 1: Frontend Foundations & Responsive Design**
  - Master HTML5 semantics, modern CSS (Flexbox & Grid), and modern JavaScript (ES6+, Promises, Async/Await).
  - Setup Git version control and practice Git branch workflows.
- 📅 **Week 2: React.js & Dynamic State Management**
  - Component architecture, Hooks (\`useState\`, \`useEffect\`, \`useMemo\`, \`useCallback\`).
  - Client-side routing and clean REST API data fetching with Axios/Fetch.
- 📅 **Week 3: Backend APIs & Database Modeling**
  - Build Node.js + Express.js REST APIs with structured MVC patterns.
  - Connect with MongoDB or PostgreSQL; implement JWT authentication & secure password hashing.
- 📅 **Week 4: Full-Stack Integration, Testing & Deployment**
  - Connect your frontend with your backend, handle loading/error boundaries.
  - Containerize with Docker and deploy live on Render/Vercel.
  - Optimize your ATS resume with your new deployed project!

👉 *To get a personalized roadmap based on your exact resume and target role, open the **⚡ Skill Gap & Roadmap** tab!*`,
        suggestedChips: ['Frontend Roadmap', 'Backend Roadmap', 'Python Roadmap', 'DSA Roadmap']
      };
    }
  },

  resume: {
    keywords: ['resume', 'cv', 'ats', 'bullet', 'formatting', 'template', 'projects on resume', 'resume kaise banaye'],
    handler: (msg, context) => ({
      reply: `Here are **proven rules to optimize your tech resume for ATS (Applicant Tracking Systems)** 📄:

1. **Use the Google XYZ Formula for Bullets**:
   - ❌ *Weak*: "Built a React website for an e-commerce store."
   - ✅ *Strong*: *"Engineered a responsive React e-commerce application with Redux, decreasing page load time by 38% and supporting 1,500+ active users."*
2. **Single-Column Machine-Readable Structure**:
   - Avoid multi-column tables, graphics, progress bars, or skill stars. ATS parsers read left-to-right and get confused by sidebars.
3. **Structured Technical Skills Section**:
   - Organize clearly into:
     - **Languages**: JavaScript (ES6+), TypeScript, Python, SQL.
     - **Frameworks & Libraries**: React.js, Node.js, Express.js, Tailwind CSS.
     - **Databases & Tools**: PostgreSQL, MongoDB, Docker, Git, Postman.
4. **Live Verification Links**:
   - Include direct clickable links to live deployed applications and GitHub source code with comprehensive README documentation.
5. **Direct Alignment**:
   - Upload your resume right now on our **📄 Upload Resume** tab to see your automated ATS score!`,
      suggestedChips: ['Upload Resume now', 'Match with Job Description', 'Top Resume Bullet Verbs']
    })
  },

  interview: {
    keywords: ['interview', 'interview question', 'technical round', 'hr round', 'mock interview', 'coding round', 'behavioral', 'star method', 'interview kaise clear kare', 'interview preparation'],
    handler: (msg, context) => ({
      reply: `Here is your **Complete Tech Interview Preparation Strategy** 🎯:

1. **Technical Coding Rounds**:
   - **Think Aloud**: Interviewers care more about your thought process than instant memorized code.
   - **Ask Clarifying Questions**: Check input constraints, negative values, and empty data sets before coding.
   - **Start with Brute Force**: State the naive solution and its $O(N^2)$ complexity, then optimize to $O(N)$ or $O(N \\log N)$.
   - **Dry Run**: Trace your code with sample input before declaring you are done.

2. **System Design & Architecture**:
   - For freshers/entry-level: Know client-server architecture, database indexing, caching with Redis, and REST vs GraphQL.

3. **Behavioral / HR Round (The STAR Method)**:
   - **S (Situation)**: Describe the background context.
   - **T (Task)**: What challenge needed to be solved?
   - **A (Action)**: What exact steps did YOU take?
   - **R (Result)**: Quantify the outcome (e.g. *"Resolved the issue in 2 hours, preventing data loss"*).

👉 *Practice technical questions right now under timed conditions on the **📝 AI Quiz** tab!*`,
      suggestedChips: ['Take 5-min AI Quiz', 'Top React interview questions', 'How to answer STAR questions?']
    })
  },

  dsa: {
    keywords: ['dsa', 'leetcode', 'algorithm', 'data structure', 'binary tree', 'graph', 'dynamic programming', 'linked list', 'array', 'dsa kaise kare'],
    handler: (msg, context) => ({
      reply: `Here is the most effective approach to **mastering Data Structures & Algorithms (DSA)** 🧠:

1. **Pick One Language**: Stick with C++, Java, or Python. Do not switch languages midway.
2. **Master Essential Patterns (Not Random Problems)**:
   - **Two Pointers & Sliding Window**: For subarrays and string problems.
   - **Fast & Slow Pointers**: For linked list cycle detection.
   - **BFS & DFS**: For level-order and path traversals in trees and graphs.
   - **Binary Search on Answer**: For optimization and search spaces.
   - **Topological Sort**: For dependency resolution.
3. **Recommended Study Plan**:
   - Solve the **NeetCode 150** or **Blind 75** list.
   - Aim for 3-5 problems per topic until the pattern clicks.
4. **Never Look at Solutions Immediately**:
   - Struggle for 25-30 minutes before checking hints. Once solved, analyze the optimal solution and write it from memory.`,
      suggestedChips: ['Top 10 DSA patterns', 'How to learn Dynamic Programming', 'Take AI Assessment Quiz']
    })
  },

  internship: {
    keywords: ['internship', 'job', 'fresher', 'placement', 'campus placement', 'off campus', 'apply', 'hiring', 'naukri', 'job kaise milegi', 'internship kaise paye'],
    handler: (msg, context) => ({
      reply: `Here is the **Proven Step-by-Step Playbook for Landing Tech Internships & Jobs** 💼:

1. **Standout Portfolio (Quality > Quantity)**:
   - Build 2 full-featured deployed web applications that solve a real problem (e.g. an AI-powered productivity app, a collaboration tool).
   - Ensure your GitHub repos have detailed READMEs with screenshots and live demo URLs.
2. **Targeted Applications & Cold Outreach**:
   - Don't just click "Easy Apply" on LinkedIn.
   - Find Engineering Managers, Founders, or Team Leads on LinkedIn and send a concise 3-line note:
     > *"Hi [Name], I noticed you are expanding your engineering team. I recently built [Project Name with Link] using React & Node.js, solving [Problem]. I'd love to contribute as a Software Engineering Intern. Here is my resume."*
3. **Alumni Referrals**:
   - Search LinkedIn for alumni from your college working at your target companies and politely request a referral.
4. **Prepare for Assessments**:
   - Regularly practice timed coding quizzes to pass online assessment (OA) rounds.`,
      suggestedChips: ['How to optimize my resume?', 'Project ideas for resume', 'Take AI Quiz']
    })
  },

  projects: {
    keywords: ['project', 'portfolio', 'project ideas', 'what to build', 'project banaye', 'best projects'],
    handler: (msg, context) => ({
      reply: `Here are **3 High-Impact Portfolio Project Ideas** that recruiters love 💡:

1. **AI-Powered SaaS Application** (Highest Value):
   - Example: Document / Resume Analyzer or AI Study Copilot.
   - Tech: React / Next.js, Node.js, Express, MongoDB/PostgreSQL, OpenAI/Gemini API.
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
      suggestedChips: ['How to describe projects on resume?', 'Full Stack Roadmap', 'Analyze my resume']
    })
  },

  concepts: {
    keywords: ['what is', 'explain', 'difference between', 'kya hai', 'vs', 'define', 'meaning of'],
    handler: (msg, context) => {
      const lower = msg.toLowerCase();
      if (lower.includes('react')) {
        return {
          reply: `**What is React.js?** ⚛️
- React is a declarative, component-based JavaScript library developed by Meta for building dynamic user interfaces.
- **Key Concepts**:
  - **Component-Driven**: UI is broken down into reusable, self-contained functional blocks.
  - **Virtual DOM**: Instead of updating the real browser DOM directly, React creates a lightweight virtual tree, calculates diffs, and batches updates efficiently.
  - **Hooks**: Built-in functions like \`useState\` (state management), \`useEffect\` (side effects), and \`useMemo\` (performance caching).
  - **One-Way Data Flow**: Data flows unidirectionally from parent to child via props.`,
          suggestedChips: ['React interview questions', 'Frontend Roadmap', 'Take React Quiz']
        };
      }
      if (lower.includes('api') || lower.includes('rest')) {
        return {
          reply: `**What is an API / RESTful API?** 🌐
- An **API (Application Programming Interface)** enables different software systems to communicate with each other.
- **REST (Representational State Transfer)** is an architectural standard using HTTP methods:
  - **GET**: Retrieve data (e.g. \`/api/users\`).
  - **POST**: Create a new resource (e.g. \`/api/login\`).
  - **PUT / PATCH**: Update existing resources.
  - **DELETE**: Remove a resource.
- **Core Principles**: Statelessness (each request contains all needed info), standard JSON payload format, and proper HTTP response codes (200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 500 Server Error).`,
          suggestedChips: ['Backend Developer Roadmap', 'Node.js vs Express', 'Take Backend Quiz']
        };
      }
      if (lower.includes('sql') || lower.includes('nosql') || lower.includes('mongodb') || lower.includes('database')) {
        return {
          reply: `**SQL vs NoSQL Databases** 🗄️:

| Feature | SQL (PostgreSQL, MySQL) | NoSQL (MongoDB, Redis) |
| :--- | :--- | :--- |
| **Structure** | Rigid tables with rows & columns | Flexible JSON-like documents or key-value |
| **Schema** | Strictly defined upfront with schemas | Dynamic, flexible schema |
| **Relationships** | Foreign keys & JOIN operations | Embedded documents or references |
| **Scaling** | Vertical (more RAM/CPU) | Horizontal (distributed clusters) |
| **Best Used For** | FinTech, E-Commerce, transactional data | Fast prototyping, real-time analytics, big data |`,
          suggestedChips: ['Backend Roadmap', 'MongoDB tips', 'Take Backend Quiz']
        };
      }
      if (lower.includes('docker') || lower.includes('container')) {
        return {
          reply: `**What is Docker?** 🐳
- Docker packages your code, runtime, system tools, and libraries into a standardized unit called a **Container**.
- **Why it matters**: Eliminates the classic *"It works on my machine!"* problem by guaranteeing identical environments across development, testing, and cloud production.
- **Core Terms**:
  - **Dockerfile**: Blueprint instructions to build your image.
  - **Docker Image**: The compiled snapshot containing the app and dependencies.
  - **Docker Container**: A live running instance of the image.`,
          suggestedChips: ['DevOps Roadmap', 'Backend Developer guide', 'Take AI Quiz']
        };
      }
      if (lower.includes('jwt') || lower.includes('token') || lower.includes('auth')) {
        return {
          reply: `**What is JWT (JSON Web Token)?** 🔐
- JWT is a compact, URL-safe standard for securely transmitting verified claims between two parties.
- **Three Parts**:
  1. **Header**: Algorithm & token type (e.g. HMAC SHA256).
  2. **Payload**: Encoded user data (e.g. \`userId\`, \`role\`, \`exp\` timestamp).
  3. **Signature**: Cryptographic signature generated with your secret key to prevent tampering.
- **How it works**: Client logs in -> Server issues JWT -> Client attaches \`Authorization: Bearer <token>\` to subsequent API requests.`,
          suggestedChips: ['Express.js security tips', 'Backend Roadmap', 'Take Backend Quiz']
        };
      }
      if (lower.includes('ats')) {
        return {
          reply: `**What is an ATS (Applicant Tracking System)?** 🤖
- An **ATS** is automated software used by 95%+ of tech companies (Workday, Greenhouse, Lever, Taleo) to scan, filter, and rank resumes before a human recruiter ever sees them.
- **How ATS algorithms rank your resume**:
  - They parse your text into structured fields (Name, Skills, Experience, Education).
  - They compute a **keyword match percentage** against the target Job Description.
  - If formatting has complex columns, tables, or non-standard fonts, the parser fails and assigns a low ranking!
👉 *Check your resume match percentage on our **📄 Upload Resume** tab!*`,
          suggestedChips: ['Upload Resume now', 'Resume tips', 'Match with Job Description']
        };
      }

      // Generic concept explanation
      return {
        reply: `That is an important technical concept! Here is a structured overview:

1. **Definition & Purpose**: In modern software engineering, understanding this concept helps build scalable, maintainable, and robust systems.
2. **Key Industry Application**: Most production codebases rely on standard design patterns, clean code principles, and efficient data flow to implement it reliably.
3. **How to Practice**:
   - Build a mini hands-on demo to test the mechanics yourself.
   - Verify your theoretical understanding by taking an adaptive evaluation on our **📝 AI Quiz** tab!

Would you like a deeper breakdown or specific code examples on this topic?`,
        suggestedChips: ['Show 4-week roadmap', 'Take AI Assessment Quiz', 'Analyze my resume']
      };
    }
  },

  hinglish: {
    keywords: ['kaise', 'kya', 'chahiye', 'batao', 'sikhna', 'madad', 'naukri', 'karna hai', 'mujhe', 'samajh', 'start kare'],
    handler: (msg, context) => ({
      reply: `Bilkul! Main aapki career preparation mein poori madad karunga 🚀:

Aapko step-by-step kya karna chahiye:
1. 📄 **Resume Upload Karein**: Sabse pehle hamare **📄 Upload Resume** tab par jaakar apna resume upload karein taaki platform aapke verified skills aur missing skills extract kar sake.
2. 🎯 **Target Job Match Karein**: **🎯 Job Description** tab mein apni dream company ki JD paste karke apna ATS Match % check karein.
3. ⚡ **4-Week Roadmap Follow Karein**: **⚡ Skill Gap & Roadmap** tab par aapko week-by-week structured modules milenge jinhe follow karke aap missing skills jaldi cover kar sakte hain.
4. 📝 **AI Quizzes Practice Karein**: Apni skills verify karne ke liye **📝 AI Quiz** tab par 5-minute timed quizzes dein aur apna readiness score 80%+ tak le jayein!

Aapko specific kis topic (e.g. *Full Stack*, *Frontend*, *Backend*, *Python*, ya *Interview Tips*) par guidance chahiye?`,
      suggestedChips: ['Full Stack Roadmap', 'Resume kaise banaye?', 'Interview tips do', 'Take AI Quiz']
    })
  }
};

/**
 * Generate intelligent AI Career Assistant response
 * @param {string} userMessage 
 * @param {object} context Optional user context (name, targetRole, missingSkills, verifiedSkills)
 * @returns {Promise<object>}
 */
async function generateChatResponse(userMessage, context = {}) {
  const msg = (userMessage || '').trim();
  const lowerMsg = msg.toLowerCase();

  // Try external Gemini API if key is available
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 15) {
    try {
      const geminiResponse = await callGeminiApi(userMessage, context);
      if (geminiResponse) {
        return geminiResponse;
      }
    } catch (err) {
      console.warn('Gemini API call failed, using built-in semantic engine:', err.message);
    }
  }

  // Personalization context prefix if user is known
  let personalizedHeader = '';
  if (context.userName && context.userName !== 'Guest' && context.userName !== 'Student') {
    personalizedHeader = `Hi **${context.userName}**! `;
  }

  // 1. Check greetings
  if (/^(hi|hello|hey|greetings|namaste|good morning|good afternoon|good evening)\b/i.test(msg)) {
    return {
      reply: `${personalizedHeader}Welcome to **CareerReady AI**! I'm your 24/7 AI Career Mentor and Technical Coach 🤖.

I can help you with:
- 🗺️ **Step-by-step Roadmaps** (Frontend, Backend, Full-Stack, Python, Java, DSA)
- 📄 **ATS Resume Optimization** & bullet-point scoring
- 🎯 **Target Job Matching** & identifying skill gaps
- 🧠 **Technical & HR Interview Preparation**
- 📝 **AI Assessment Quizzes** & progress tracking

What career goal, technical topic, or roadmap would you like to explore today?`,
      suggestedChips: [
        'Give me 4-week roadmap',
        'How to optimize my resume?',
        'Full Stack Developer guide',
        'Take AI Technical Quiz'
      ]
    };
  }

  // 2. Search categorized knowledge handlers
  for (const [key, category] of Object.entries(KNOWLEDGE_BASE)) {
    if (category.keywords.some(kw => lowerMsg.includes(kw))) {
      const result = category.handler(msg, context);
      return {
        reply: `${personalizedHeader}${result.reply}`,
        suggestedChips: result.suggestedChips || ['Give me roadmap', 'Upload Resume', 'Take AI Quiz']
      };
    }
  }

  // 3. Fallback Dynamic Intelligent Responder (Answers ANY freeform query)
  return {
    reply: `${personalizedHeader}That's a great question regarding **${msg.replace(/[?.,!]/g, '')}**!

Here is actionable guidance to approach this effectively:

1. **Understand Core Competencies**:
   - High-growth tech roles prioritize practical problem-solving, structured code architecture, and clear communication.
2. **Follow a Guided Learning Plan**:
   - Focus on mastering one module at a time rather than scattered tutorials. Check out our **⚡ Skill Gap & Roadmap** tab for an organized weekly timeline.
3. **Build & Deploy Proof-of-Work**:
   - Implement small, functional projects that demonstrate your ability to write clean, tested code and integrate APIs.
4. **Validate Through Testing**:
   - Practice under timed conditions on our **📝 AI Quiz** tab to verify your mastery and boost your Overall Career Readiness Score.

Would you like me to generate a specific roadmap or share interview questions for this topic?`,
    suggestedChips: [
      'Give me 4-week roadmap',
      'How to optimize my resume?',
      'Take 5-min AI Quiz',
      'View my Skill Gaps'
    ]
  };
}

/**
 * Optional Gemini API caller
 */
function callGeminiApi(prompt, context) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.GEMINI_API_KEY;
    const postData = JSON.stringify({
      contents: [{
        parts: [{
          text: `You are CareerReady AI's intelligent Career Mentor and Technical Coach for students and job seekers.
User Context: Name: ${context.userName || 'Student'}, Target Role: ${context.targetRole || 'Software Engineer'}, Readiness Score: ${context.readinessScore || 'N/A'}%, Missing Skills: ${(context.missingSkills || []).join(', ')}.
User Question: ${prompt}
Provide an encouraging, direct, highly structured response in clean Markdown with clear bullet points. Answer the user's specific question directly.`
        }]
      }]
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 8000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const reply = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            resolve({
              reply,
              suggestedChips: ['Give me roadmap', 'Check skill gaps', 'Take AI Quiz']
            });
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });
    req.write(postData);
    req.end();
  });
}

module.exports = {
  generateChatResponse
};
