/**
 * Personalized Learning Roadmap Generator
 * Builds week-by-week learning pathways based on candidate's missing and weak skills.
 */

// Curated high quality free resources database
const SKILL_RESOURCES = {
  'React': {
    docs: 'https://react.dev/learn',
    course: 'https://www.freecodecamp.org/news/learn-react-by-building-projects/',
    project: 'Build an Interactive Dashboard or E-Commerce Cart with State Management'
  },
  'Node.js': {
    docs: 'https://nodejs.org/en/docs',
    course: 'https://www.freecodecamp.org/news/free-nodejs-course-with-express/',
    project: 'Create a RESTful CRUD API with Express, JWT Authentication and Middleware'
  },
  'Express.js': {
    docs: 'https://expressjs.com/en/starter/installing.html',
    course: 'https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs',
    project: 'Build an API Gateway with Route Handlers and Input Validation'
  },
  'MongoDB': {
    docs: 'https://www.mongodb.com/docs/',
    course: 'https://learn.mongodb.com/',
    project: 'Design Schema & Aggregation Pipeline for an Order Management System'
  },
  'TypeScript': {
    docs: 'https://www.typescriptlang.org/docs/',
    course: 'https://www.freecodecamp.org/news/learn-typescript-beginners-guide/',
    project: 'Refactor a JavaScript Web App into Strict TypeScript with Interfaces and Generics'
  },
  'Docker': {
    docs: 'https://docs.docker.com/get-started/',
    course: 'https://www.freecodecamp.org/news/the-docker-handbook/',
    project: 'Dockerize a Multi-Container Application (Frontend, Backend, Database) with Docker Compose'
  },
  'Git': {
    docs: 'https://git-scm.com/doc',
    course: 'https://www.freecodecamp.org/news/git-and-github-for-beginners/',
    project: 'Configure Branch Protection, Pull Request Reviews, and GitHub Actions CI'
  },
  'AWS': {
    docs: 'https://aws.amazon.com/getting-started/',
    course: 'https://www.freecodecamp.org/news/aws-certified-cloud-practitioner-study-course/',
    project: 'Deploy a Serverless REST API with AWS Lambda, API Gateway, and S3'
  },
  'Java': {
    docs: 'https://docs.oracle.com/en/java/',
    course: 'https://dev.java/learn/',
    project: 'Implement Object-Oriented Design Patterns and Multi-Threading Simulation'
  },
  'Spring Boot': {
    docs: 'https://spring.io/guides',
    course: 'https://www.freecodecamp.org/news/build-a-spring-boot-app-with-spring-security/',
    project: 'Build an Enterprise Microservice with Spring Data JPA and Spring Security'
  },
  'Python': {
    docs: 'https://docs.python.org/3/tutorial/',
    course: 'https://www.freecodecamp.org/news/python-for-beginners-handbook/',
    project: 'Build Automated Web Scraper and Data Processing Pipeline'
  },
  'Machine Learning': {
    docs: 'https://scikit-learn.org/stable/user_guide.html',
    course: 'https://www.freecodecamp.org/news/machine-learning-course-with-python/',
    project: 'Train and Evaluate a Predictive Classification Model with Scikit-Learn'
  },
  'PostgreSQL': {
    docs: 'https://www.postgresql.org/docs/',
    course: 'https://www.freecodecamp.org/news/learn-postgresql-full-course/',
    project: 'Design Relational Schema, Indexes, Foreign Keys, and Complex Analytical Joins'
  }
};

function generateRoadmap(missingSkills = [], weakSkills = [], targetRole = 'Full Stack Developer') {
  const targetSkills = [...missingSkills, ...weakSkills];
  const primarySkills = targetSkills.slice(0, 4);

  // If no missing skills, provide advanced optimization roadmap
  if (primarySkills.length === 0) {
    primarySkills.push({ name: 'System Design', category: 'architecture' }, { name: 'CI/CD & Testing', category: 'devops' });
  }

  const weeks = [];
  
  // Week 1: Foundations & Core Concepts
  const w1Skills = primarySkills.slice(0, 2);
  weeks.push({
    weekNumber: 1,
    title: 'Week 1: Core Fundamentals & Concept Mastery',
    duration: '7 Days',
    focus: w1Skills.map(s => s.name).join(' & '),
    objectives: [
      `Understand syntax, core paradigms, and internal workings of ${w1Skills.map(s => s.name).join(', ')}.`,
      'Set up local development environment, tooling, and run first working demos.',
      'Complete fundamental exercises and documentation tutorials.'
    ],
    tasks: [
      { id: 't1_1', text: `Read official documentation and setup guides for ${w1Skills[0] ? w1Skills[0].name : 'Language'}`, completed: false },
      { id: 't1_2', text: `Solve 10 practice coding exercises covering core data structures and syntax`, completed: false },
      { id: 't1_3', text: `Build a minimalist CLI or starter prototype applying the fundamental concepts`, completed: false }
    ],
    resources: w1Skills.map(s => ({
      skill: s.name,
      docsUrl: (SKILL_RESOURCES[s.name] && SKILL_RESOURCES[s.name].docs) || 'https://developer.mozilla.org',
      courseUrl: (SKILL_RESOURCES[s.name] && SKILL_RESOURCES[s.name].course) || 'https://www.freecodecamp.org'
    })),
    projectMilestone: `Console or Starter Prototype implementing ${w1Skills.map(s => s.name).join(' + ')} basics.`
  });

  // Week 2: Deep Dive & Practical Application
  const w2Skills = primarySkills.length > 2 ? primarySkills.slice(2, 4) : primarySkills;
  weeks.push({
    weekNumber: 2,
    title: 'Week 2: Hands-on Building & Real-World Integration',
    duration: '7 Days',
    focus: w2Skills.map(s => s.name).join(' & '),
    objectives: [
      `Master intermediate to advanced features of ${w2Skills.map(s => s.name).join(', ')}.`,
      'Integrate APIs, state/data management, and persistent storage.',
      'Implement robust error handling and modular design patterns.'
    ],
    tasks: [
      { id: 't2_1', text: `Implement asynchronous workflows, REST APIs, or data models`, completed: false },
      { id: 't2_2', text: `Connect application components and handle edge cases gracefully`, completed: false },
      { id: 't2_3', text: `Commit all progress to GitHub with clear atomic commit messages`, completed: false }
    ],
    resources: w2Skills.map(s => ({
      skill: s.name,
      docsUrl: (SKILL_RESOURCES[s.name] && SKILL_RESOURCES[s.name].docs) || 'https://roadmap.sh',
      courseUrl: (SKILL_RESOURCES[s.name] && SKILL_RESOURCES[s.name].course) || 'https://www.freecodecamp.org'
    })),
    projectMilestone: (SKILL_RESOURCES[w2Skills[0] ? w2Skills[0].name : ''] && SKILL_RESOURCES[w2Skills[0].name].project) || 'End-to-End Functional Micro-Project'
  });

  // Week 3: Testing, Optimization & Architecture
  weeks.push({
    weekNumber: 3,
    title: 'Week 3: Code Quality, Testing & Deployment',
    duration: '7 Days',
    focus: 'Performance, Automated Testing & Containerization',
    objectives: [
      'Write unit and integration tests to ensure reliable code.',
      'Refactor code following Clean Code principles and design patterns.',
      'Containerize application with Docker and set up automated CI pipeline.'
    ],
    tasks: [
      { id: 't3_1', text: 'Write automated unit tests for core business logic functions', completed: false },
      { id: 't3_2', text: 'Benchmark and optimize execution speed / API latency', completed: false },
      { id: 't3_3', text: 'Deploy the application to cloud hosting (Render / Vercel / Railway)', completed: false }
    ],
    resources: [
      { skill: 'Docker & Testing', docsUrl: 'https://docs.docker.com/', courseUrl: 'https://www.freecodecamp.org' }
    ],
    projectMilestone: 'Deployed Cloud Application with automated GitHub CI build checks.'
  });

  // Week 4: Capstone Portfolio & Interview Prep
  weeks.push({
    weekNumber: 4,
    title: 'Week 4: Capstone Project & Technical Interview Mastery',
    duration: '7 Days',
    focus: 'Full Portfolio Showcase & Mock Interviews',
    objectives: [
      `Complete a standout Capstone project highlighting ${primarySkills.map(s => s.name).join(', ')}.`,
      'Prepare comprehensive technical interview answers and live coding practice.',
      'Update resume and LinkedIn profile with demonstrable project links.'
    ],
    tasks: [
      { id: 't4_1', text: 'Write comprehensive README with architecture diagram, live demo link, and setup guide', completed: false },
      { id: 't4_2', text: `Complete 20 interview MCQs & coding challenges on ${targetRole}`, completed: false },
      { id: 't4_3', text: 'Conduct a peer mock interview and refine explanations of your architectural choices', completed: false }
    ],
    resources: [
      { skill: 'Interview Prep', docsUrl: 'https://leetcode.com', courseUrl: 'https://github.com/jwasham/coding-interview-university' }
    ],
    projectMilestone: `Production-grade Portfolio Showcase Project ready for ${targetRole} job applications.`
  });

  return {
    targetRole,
    estimatedWeeks: weeks.length,
    skillsAddressed: primarySkills.map(s => s.name),
    weeks
  };
}

module.exports = {
  generateRoadmap
};
