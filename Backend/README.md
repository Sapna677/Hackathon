# Career Readiness & Skill Gap Platform - Backend

This is the backend REST API for the **AI-Powered Career Readiness & Skill Gap Platform**, built according to the architecture blueprint.

## 🌟 Key Capabilities
- **Authentication**: JWT-based User Registration, Login, and Demo Login.
- **Resume Upload & Parsing**: Extracts raw text, candidate details, and skills from uploaded PDF/text resumes.
- **Job Description Analysis**: Extracts required & nice-to-have skills from custom JDs or pre-configured industry job profiles.
- **AI Skill Gap Engine**: Identifies Matched, Missing, and Weak skills, and calculates a percentage Career Readiness Score.
- **Personalized Learning Roadmap**: Generates a 4-week structured curriculum with curated free courses, official docs, and milestone projects.
- **AI Quiz Assessment**: Generates tailored MCQs for missing skills with instant grading, countdown timer, and explanations.
- **Progress Tracking**: Aggregates skill gap reduction %, quiz accuracy history, and roadmap completion metrics.
- **Zero-Friction Database**: Dual-mode storage that connects to MongoDB if available, or automatically falls back to an embedded JSON database (`data/db.json`).

## 🚀 Quick Start Instructions

1. Open PowerShell / Command Prompt inside this `Backend` folder:
   ```bash
   cd c:\Users\HP\OneDrive\Desktop\Hackathon\Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Server will be active at:
   `http://localhost:5000`

5. Verify server health:
   Open `http://localhost:5000/api/health` in your browser.
