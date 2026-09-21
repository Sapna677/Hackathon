/**
 * AI Career Mentor & Copilot Conversational Service
 * Handles career guidance, resume suggestions, skill gap explanations,
 * technical interview prep, and platform navigation.
 */

const https = require('https');

// Knowledge base for common career pathways, skills, and advice
const KNOWLEDGE_BASE = {
  frontend: {
    keywords: ['frontend', 'react', 'css', 'html', 'javascript', 'vue', 'tailwind', 'ui', 'ux'],
    role: 'Frontend Developer',
    advice: `To master **Frontend Development**, focus on these core milestones:
1. **Core Fundamentals**: Semantic HTML5, modern CSS3 (Flexbox & CSS Grid), and ES6+ JavaScript (Promises, Async/Await, Destructuring).
2. **Framework Mastery**: Deep dive into **React.js** (Hooks, State Management like Redux/Zustand, Component Lifecycle).
3. **Responsive & Accessible Design**: Mobile-first layouts, Web Vitals, and WCAG accessibility standards.
4. **Tooling & Build Systems**: Vite, Webpack, Git, and RESTful API integration.
5. **Portfolio Projects**: Build at least 2 full-featured apps (e.g. an E-commerce store or a Real-time Dashboard) and deploy on Vercel/Netlify.`,
    suggestedChips: ['React interview questions', 'How to test my Frontend skills?', 'Show 4-week roadmap']
  },
  backend: {
    keywords: ['backend', 'node', 'nodejs', 'express', 'database', 'sql', 'mongodb', 'api', 'docker'],
    role: 'Backend Developer',
    advice: `For **Backend Engineering**, industry-standard competencies include:
1. **Runtime & Server Frameworks**: **Node.js** with **Express.js** or Fastify for high-performance REST APIs.
2. **Databases**: Relational (PostgreSQL/MySQL) with indexing and migrations, plus NoSQL (**MongoDB**) for flexible schemas.
3. **Authentication & Security**: JWT tokens, bcrypt password hashing, OAuth2, and CORS protection.
4. **Architecture & DevOps**: Microservices concepts, Docker containerization, caching with Redis, and CI/CD pipelines.
5. **API Documentation & Testing**: Swagger/OpenAPI, Jest/Supertest for automated unit and integration tests.`,
    suggestedChips: ['Express.js security tips', 'MongoDB vs PostgreSQL', 'Take backend quiz']
  },
  fullstack: {
    keywords: ['full stack', 'fullstack', 'mern', 'mean', 'web dev', 'web development'],
    role: 'Full Stack Developer',
    advice: `To excel as a **Full Stack Developer (MERN / Next.js)**:
1. **Unified Stack**: React for the frontend, Node.js + Express for the API, MongoDB/PostgreSQL for data persistence.
2. **State & Data Flow**: Efficient client-side fetching with React Query/SWR and clean REST/GraphQL endpoints.
3. **Deployment & DevOps**: Dockerize your frontend and backend containers, configure Nginx reverse proxy, and deploy to AWS, Railway, or Render.
4. **Testing**: End-to-end testing with Cypress or Playwright.`,
    suggestedChips: ['Check my Full Stack gaps', 'Start Full Stack Quiz', 'Generate 4-week roadmap']
  },
  resume: {
    keywords: ['resume', 'cv', 'ats', 'bullet', 'formatting', 'template', 'projects'],
    advice: `Here are **high-impact tips to optimize your tech resume for ATS (Applicant Tracking Systems)**:
1. **Use Action Verbs & Metrics (XYZ Formula)**: Instead of "Built a React website", write: *"Developed a responsive React web application with Redux, reducing page load latency by 35% across 2,000+ active users."*
2. **Explicit Skills Section**: Group technical skills cleanly into *Languages, Frameworks, Databases, Tools & Platforms*. Avoid vague skill bars or stars.
3. **Single Column, Machine-Readable Layout**: Avoid multi-column tables, text boxes, or decorative graphics that confuse ATS parsers.
4. **Project Links**: Include live deployment URLs and clean GitHub repository links with informative README files.
5. **Role Alignment**: Tailor keywords directly to the target Job Description (e.g. use our **Job Matcher** view to inspect alignment!).`,
    suggestedChips: ['Analyze my resume', 'What skills am I missing?', 'Match with a Job Description']
  },
  skillGap: {
    keywords: ['gap', 'readiness', 'score', 'missing', 'weak', 'percentage', 'calculate'],
    advice: `**How Career Readiness & Skill Gap Analysis works**:
- **Readiness Score**: Calculated by matching verified competencies from your resume against target industry Job Descriptions.
- **Match Breakdown**:
  - 🟢 **80%+ (Job Ready)**: Strong technical alignment; ready for technical interviews.
  - 🟡 **50% - 79% (Coaching Needed)**: Solid foundation, but critical framework or database skills are missing.
  - 🔴 **Below 50% (Foundational)**: High priority to complete the 4-week structured roadmap.
- **How to Boost Your Score**: Complete our week-by-week roadmap milestones and verify each competency by taking the **AI Assessment Quiz**!`,
    suggestedChips: ['View my Skill Gaps', 'Start AI Quiz now', 'Inspect Roadmap']
  },
  quiz: {
    keywords: ['quiz', 'test', 'assessment', 'mcq', 'interview question', 'practice'],
    advice: `Our **AI Technical Assessment Quiz** helps you test and verify your skills:
- Each quiz provides 5 adaptive questions customized to your missing or target skills (React, Express, Docker, JavaScript, etc.).
- Includes a 5-minute countdown timer and instant explanations for every solution.
- Passing quizzes increases your verified competencies and boosts your Overall Readiness Score!
- Head over to the **AI Quiz** tab anytime to start a quick 5-minute evaluation!`,
    suggestedChips: ['Take 5-minute quiz', 'How to pass React quiz?', 'Show my test score']
  }
};

/**
 * Generate intelligent AI Career Assistant response
 * @param {string} userMessage 
 * @param {object} context Optional user context (name, targetRole, missingSkills, verifiedSkills)
 * @returns {Promise<object>}
 */
async function generateChatResponse(userMessage, context = {}) {
  const msg = (userMessage || '').trim().toLowerCase();

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
  if (context.userName && context.userName !== 'Guest') {
    personalizedHeader = `Hi **${context.userName}**! `;
  }

  // Check matching category in knowledge base
  for (const [key, category] of Object.entries(KNOWLEDGE_BASE)) {
    if (category.keywords.some(kw => msg.includes(kw))) {
      let extraContext = '';
      if (key === 'skillGap' || key === 'resume' || key === 'frontend' || key === 'backend' || key === 'fullstack') {
        if (context.missingSkills && context.missingSkills.length > 0) {
          extraContext = `\n\n💡 **Your Active Profile Context**: Based on your latest resume, your key missing skills are: **${context.missingSkills.slice(0, 4).join(', ')}**. Tackling these will significantly boost your **${context.readinessScore || 70}% Readiness Score**!`;
        }
      }

      return {
        reply: `${personalizedHeader}${category.advice}${extraContext}`,
        suggestedChips: category.suggestedChips || ['Upload Resume', 'Take AI Quiz', 'View Roadmap']
      };
    }
  }

  // Greetings
  if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey') || msg.includes('namaste')) {
    return {
      reply: `${personalizedHeader}Welcome to **CareerReady AI**! I'm your 24/7 AI Career Mentor. 

I can help you with:
- 📄 **Resume ATS optimization** and skill extraction feedback
- 🎯 **Target Job Description matching** and readiness scoring
- ⚡ **Personalized 4-week learning roadmaps** to bridge missing skills
- 📝 **Technical interview practice** & AI assessment quizzes

What career goal or technical topic would you like to explore today?`,
      suggestedChips: [
        'How to improve my resume?',
        'How to become a Full Stack Dev?',
        'Analyze my skill gaps',
        'Take AI Technical Quiz'
      ]
    };
  }

  // General helpful career advice
  return {
    reply: `${personalizedHeader}That's a great question regarding tech career readiness! 

Here are recommended next steps:
1. **Upload your Resume**: Let our parser extract your verified technical competencies.
2. **Match with Target Role**: See exactly what frameworks, libraries, or tools you are missing.
3. **Follow the AI Roadmap**: Study targeted modules week-by-week.
4. **Take the AI Quiz**: Validate each skill with adaptive quizzes to demonstrate verified competency to hiring managers!

Would you like specific guidance on **Frontend**, **Backend**, **Resume Formatting**, or **Technical Quizzes**?`,
    suggestedChips: [
      'Frontend Developer guide',
      'Backend Developer guide',
      'Resume ATS tips',
      'Take 5-min AI Quiz'
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
Provide an encouraging, concise, highly actionable response in clean Markdown with bullet points.`
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
              suggestedChips: ['Check skill gaps', 'Take AI Quiz', 'View 4-week roadmap']
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
