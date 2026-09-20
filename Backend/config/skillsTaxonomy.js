/**
 * Comprehensive Skills Taxonomy and Knowledge Base
 * Categorized technical and soft skills with aliases for high-precision regex extraction.
 */
const SKILLS_TAXONOMY = {
  languages: [
    { name: 'JavaScript', aliases: ['javascript', 'js', 'es6', 'ecmascript'] },
    { name: 'TypeScript', aliases: ['typescript', 'ts'] },
    { name: 'Python', aliases: ['python', 'python3', 'py'] },
    { name: 'Java', aliases: ['java', 'jdk', 'core java'] },
    { name: 'C++', aliases: ['c++', 'cpp'] },
    { name: 'C#', aliases: ['c#', 'csharp', '.net'] },
    { name: 'Go', aliases: ['golang', 'go lang'] },
    { name: 'Rust', aliases: ['rust'] },
    { name: 'PHP', aliases: ['php'] },
    { name: 'Ruby', aliases: ['ruby', 'ruby on rails'] },
    { name: 'SQL', aliases: ['sql', 't-sql', 'pl/sql'] },
    { name: 'HTML5', aliases: ['html', 'html5'] },
    { name: 'CSS3', aliases: ['css', 'css3'] }
  ],
  frontend: [
    { name: 'React', aliases: ['react', 'react.js', 'reactjs'] },
    { name: 'Next.js', aliases: ['next.js', 'nextjs'] },
    { name: 'Vue.js', aliases: ['vue', 'vue.js', 'vuejs'] },
    { name: 'Angular', aliases: ['angular', 'angularjs'] },
    { name: 'Tailwind CSS', aliases: ['tailwind', 'tailwindcss'] },
    { name: 'Bootstrap', aliases: ['bootstrap', 'bootstrap5'] },
    { name: 'Redux', aliases: ['redux', 'redux toolkit', 'rtk'] },
    { name: 'SASS/SCSS', aliases: ['sass', 'scss'] },
    { name: 'Webpack', aliases: ['webpack', 'vite'] },
    { name: 'Responsive Design', aliases: ['responsive design', 'mobile first', 'flexbox', 'css grid'] }
  ],
  backend: [
    { name: 'Node.js', aliases: ['node', 'node.js', 'nodejs'] },
    { name: 'Express.js', aliases: ['express', 'express.js', 'expressjs'] },
    { name: 'Spring Boot', aliases: ['spring boot', 'spring framework', 'spring', 'spring mvc'] },
    { name: 'Django', aliases: ['django'] },
    { name: 'FastAPI', aliases: ['fastapi'] },
    { name: 'Flask', aliases: ['flask'] },
    { name: 'NestJS', aliases: ['nestjs', 'nest.js'] },
    { name: 'ASP.NET Core', aliases: ['asp.net', 'asp.net core', '.net core'] },
    { name: 'RESTful APIs', aliases: ['rest api', 'restful api', 'rest apis', 'restful'] },
    { name: 'GraphQL', aliases: ['graphql', 'apollo'] },
    { name: 'Microservices', aliases: ['microservices', 'microservice architecture'] }
  ],
  databases: [
    { name: 'MongoDB', aliases: ['mongodb', 'mongo', 'mongoose'] },
    { name: 'PostgreSQL', aliases: ['postgresql', 'postgres'] },
    { name: 'MySQL', aliases: ['mysql'] },
    { name: 'Redis', aliases: ['redis', 'caching'] },
    { name: 'Firebase', aliases: ['firebase', 'firestore'] },
    { name: 'Oracle DB', aliases: ['oracle database', 'oracle db'] },
    { name: 'SQLite', aliases: ['sqlite'] },
    { name: 'Cassandra', aliases: ['cassandra'] },
    { name: 'DynamoDB', aliases: ['dynamodb'] }
  ],
  cloudDevOps: [
    { name: 'Docker', aliases: ['docker', 'containerization', 'containers'] },
    { name: 'Kubernetes', aliases: ['kubernetes', 'k8s'] },
    { name: 'AWS', aliases: ['aws', 'amazon web services', 'ec2', 's3', 'lambda'] },
    { name: 'Azure', aliases: ['azure', 'microsoft azure'] },
    { name: 'Google Cloud Platform (GCP)', aliases: ['gcp', 'google cloud'] },
    { name: 'CI/CD', aliases: ['ci/cd', 'github actions', 'jenkins', 'gitlab ci'] },
    { name: 'Git', aliases: ['git', 'github', 'gitlab', 'version control'] },
    { name: 'Linux', aliases: ['linux', 'bash', 'shell scripting', 'ubuntu'] },
    { name: 'Nginx', aliases: ['nginx'] },
    { name: 'Terraform', aliases: ['terraform'] }
  ],
  dataAndAI: [
    { name: 'Machine Learning', aliases: ['machine learning', 'ml'] },
    { name: 'Deep Learning', aliases: ['deep learning', 'neural networks'] },
    { name: 'TensorFlow', aliases: ['tensorflow'] },
    { name: 'PyTorch', aliases: ['pytorch'] },
    { name: 'Pandas', aliases: ['pandas'] },
    { name: 'NumPy', aliases: ['numpy'] },
    { name: 'Scikit-Learn', aliases: ['scikit-learn', 'sklearn'] },
    { name: 'Natural Language Processing (NLP)', aliases: ['nlp', 'natural language processing'] },
    { name: 'Large Language Models (LLMs)', aliases: ['llm', 'llms', 'generative ai', 'openai api'] },
    { name: 'Computer Vision', aliases: ['computer vision', 'opencv'] }
  ],
  softSkills: [
    { name: 'Problem Solving', aliases: ['problem solving', 'analytical skills'] },
    { name: 'Communication', aliases: ['communication', 'verbal communication', 'written communication'] },
    { name: 'Team Collaboration', aliases: ['teamwork', 'team player', 'collaboration'] },
    { name: 'Agile/Scrum', aliases: ['agile', 'scrum', 'sprint planning', 'jira'] },
    { name: 'Critical Thinking', aliases: ['critical thinking', 'decision making'] },
    { name: 'Time Management', aliases: ['time management', 'prioritization'] }
  ]
};

// Pre-defined job profiles with standard requirements
const PREDEFINED_ROLES = [
  {
    id: 'fullstack-dev',
    title: 'Full Stack Web Developer',
    level: 'Entry / Junior',
    requiredSkills: ['JavaScript', 'React', 'Node.js', 'Express.js', 'MongoDB', 'RESTful APIs', 'Git', 'HTML5', 'CSS3'],
    preferredSkills: ['TypeScript', 'Docker', 'Redux', 'PostgreSQL', 'Tailwind CSS'],
    description: 'Looking for a passionate Full Stack Developer to build modern responsive web applications using the MERN stack. Must be proficient in JavaScript, React, Node.js, Express, and MongoDB. Experience with RESTful APIs, Git version control, and responsive design is required.'
  },
  {
    id: 'frontend-dev',
    title: 'Frontend React Developer',
    level: 'Entry / Mid',
    requiredSkills: ['JavaScript', 'TypeScript', 'React', 'HTML5', 'CSS3', 'Tailwind CSS', 'Redux', 'Git'],
    preferredSkills: ['Next.js', 'Responsive Design', 'Webpack', 'CI/CD'],
    description: 'Seeking a creative Frontend Developer proficient in React.js, TypeScript, and modern CSS frameworks like Tailwind CSS. You will create performant user interfaces, state management with Redux, and integrate backend REST APIs.'
  },
  {
    id: 'backend-dev',
    title: 'Backend Node.js & Java Engineer',
    level: 'Entry / Junior',
    requiredSkills: ['Node.js', 'Express.js', 'Java', 'Spring Boot', 'RESTful APIs', 'PostgreSQL', 'MongoDB', 'Git'],
    preferredSkills: ['Docker', 'Microservices', 'Redis', 'AWS', 'Linux'],
    description: 'Join our engineering team to build scalable microservices and RESTful APIs. Proficiency in Node.js or Java (Spring Boot), database architecture (PostgreSQL or MongoDB), and containerization (Docker) is highly valued.'
  },
  {
    id: 'data-ai-engineer',
    title: 'AI & Data Science Specialist',
    level: 'Entry / Junior',
    requiredSkills: ['Python', 'SQL', 'Pandas', 'NumPy', 'Machine Learning', 'Scikit-Learn', 'Git'],
    preferredSkills: ['Deep Learning', 'PyTorch', 'TensorFlow', 'Natural Language Processing (NLP)', 'AWS'],
    description: 'Exciting opportunity for a Data & AI Engineer to extract insights and build predictive models. Requires strong command of Python, data analysis with Pandas/NumPy, SQL databases, and machine learning model development.'
  },
  {
    id: 'devops-cloud-engineer',
    title: 'DevOps & Cloud Engineer',
    level: 'Entry / Junior',
    requiredSkills: ['Linux', 'Git', 'Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Bash'],
    preferredSkills: ['Terraform', 'Python', 'Nginx', 'Azure', 'Microservices'],
    description: 'We need a DevOps Engineer to manage our cloud infrastructure, automate deployment pipelines with CI/CD and Docker/Kubernetes, and ensure high availability and security on AWS.'
  }
];

module.exports = {
  SKILLS_TAXONOMY,
  PREDEFINED_ROLES
};
