# AI-Powered Career Readiness & Skill Gap Platform
> *From Your Resume ➔ To Your Dream Job ➔ With AI Guidance*
> *Learn | Improve | Grow - Smarter Skills. Better Opportunities.*

An end-to-end intelligent platform that analyzes resumes against target job descriptions, identifies technical and soft skill gaps, creates personalized weekly learning roadmaps, generates tailored AI quizzes, and tracks student/fresher career readiness.

---

## 📁 Project Architecture & Folder Organization

```
Hackathon/
├── Backend/                         # Complete Server, REST APIs, & AI Layer
│   ├── config/                      # Database (MongoDB + JSON fallback) & Skills taxonomy
│   │   ├── db.js                    # Persistent dual-mode storage
│   │   └── skillsTaxonomy.js        # Comprehensive tech skills dictionary
│   ├── controllers/                 # Modular request handlers
│   │   ├── auth.controller.js       # Register, login, demo-login, JWT profile
│   │   ├── resume.controller.js     # PDF/text resume parsing & sample profiles
│   │   ├── jd.controller.js         # Pre-defined roles & custom JD analyzer
│   │   ├── gap.controller.js        # Matched/missing/weak skills & score engine
│   │   ├── roadmap.controller.js    # Week-by-week curriculum generator
│   │   ├── quiz.controller.js       # AI MCQ generator & evaluation engine
│   │   └── progress.controller.js   # Success metrics & historical trends
│   ├── middleware/                  # JWT auth & Multer PDF upload handlers
│   │   ├── auth.middleware.js
│   │   └── upload.middleware.js
│   ├── routes/                      # Express route endpoints (/api/*)
│   ├── services/                    # Business logic & parsing engines
│   │   ├── pdfParser.service.js     # PDF text extraction
│   │   ├── skillExtractor.service.js# Regex keyword extractor
│   │   ├── gapEngine.service.js     # Skill gap & readiness algorithm
│   │   ├── roadmap.service.js       # Curated 4-week roadmap with free resources
│   │   └── quiz.service.js          # Dynamic question generator & validator
│   ├── package.json                 # Node dependencies
│   ├── server.js                    # Express application entrypoint
│   └── README.md
│
└── Frontend/                        # Client Web Application (HTML5, CSS3, JavaScript)
    ├── css/
    │   └── styles.css               # Glassmorphism, animations, gauges & responsive layout
    ├── js/
    │   ├── api.js                   # REST API client
    │   ├── auth.js                  # User authentication & 1-click demo login
    │   ├── resume.js                # Resume drag-and-drop & parsing preview
    │   ├── jd.js                    # Target job role picker & JD extractor
    │   ├── gap.js                   # Skill gap engine UI & readiness gauge
    │   ├── roadmap.js               # Interactive 4-week learning roadmap
    │   ├── quiz.js                  # Timed AI MCQ assessment engine
    │   ├── progress.js              # Canvas readiness growth charts
    │   └── app.js                   # Master SPA router & toast notifications
    ├── index.html                   # Main application containing all 8 website sections
    └── README.md
```

---

## ⚡ How to Run the Project

### 1. Start the Backend:
Open PowerShell / Terminal in the `Backend` directory:
```bash
cd Backend
npm start
```
The server will boot on `http://localhost:5000`.

### 2. Open the Frontend:
- Open `Frontend/index.html` directly in any web browser (Chrome, Edge, Firefox), OR
- Visit `http://localhost:5000` in your browser (since the backend automatically serves the frontend folder too!).

### 3. Demo Walkthrough:
1. Click **⚡ 1-Click Demo** in the top right navbar (or register a new user).
2. Go to **Upload Resume** ➔ Click **⚡ Load Frontend Fresher Resume** (or upload your own PDF).
3. Go to **Job Description** ➔ Click **Select This Role 🎯** on "Full Stack Web Developer".
4. View your **Skill Gap Analysis** (Readiness score gauge, Matched, Missing, and Weak skills).
5. Review the **Personalized Learning Roadmap** and check off completed weekly action items.
6. Click **Test Missing Skills With AI Quiz** to take a timed 5-question assessment and view instant explanations!
7. Check the **Progress Dashboard** to view your readiness growth chart and success metrics.
8. Access the **🛡️ Admin Portal**:
   - Click **🛡️ Admin Login** on the auth page or navbar.
   - Credentials: `admin@careerready.ai` | `admin123` (or click **⚡ 1-Click Instant Admin Access**).
   - View cohort readiness KPIs, student directory, search & filters, and deep-dive student dossiers.

