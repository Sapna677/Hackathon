/**
 * AI Quiz & Skill Assessment Service
 * Dynamically serves MCQs tailored to the user's missing and weak skills.
 */

const QUESTION_BANK = {
  'Express.js': [
    {
      id: 'express_1',
      skill: 'Express.js',
      question: 'What is the correct signature for an Express.js middleware function with error handling?',
      options: [
        'function(req, res)',
        'function(err, req, res, next)',
        'function(req, res, next, error)',
        'function(next, err)'
      ],
      correctAnswer: 1,
      explanation: 'Error-handling middleware in Express is uniquely identified by accepting exactly 4 arguments: (err, req, res, next).'
    },
    {
      id: 'express_2',
      skill: 'Express.js',
      question: 'Which built-in middleware function in Express is used to parse incoming requests with JSON payloads?',
      options: ['express.urlencoded()', 'express.json()', 'express.static()', 'express.router()'],
      correctAnswer: 1,
      explanation: '`express.json()` is the built-in middleware based on body-parser that parses incoming requests with JSON payloads.'
    },
    {
      id: 'express_3',
      skill: 'Express.js',
      question: 'How do you extract route parameters from a route defined as `/users/:userId` in Express?',
      options: ['req.body.userId', 'req.params.userId', 'req.query.userId', 'req.headers.userId'],
      correctAnswer: 1,
      explanation: 'Route parameters named in the path pattern are populated in the `req.params` object.'
    }
  ],
  'Responsive Design': [
    {
      id: 'resp_1',
      skill: 'Responsive Design',
      question: 'Which HTML tag configuration is essential for responsive mobile viewport scaling?',
      options: [
        'meta name="viewport" content="width=device-width, initial-scale=1.0"',
        'meta name="responsive" content="scale=mobile, enabled=true"',
        'meta name="mobile-first" content="width=screen"',
        'meta name="device" content="all, initial-scale=1"'
      ],
      correctAnswer: 0,
      explanation: 'The viewport meta tag instructs the browser to match the page width to the device screen and sets initial zoom.'
    },
    {
      id: 'resp_2',
      skill: 'Responsive Design',
      question: 'What is the primary CSS technique used to apply styling conditionally based on screen width or orientation?',
      options: ['CSS Grid', 'CSS Media Queries (@media)', 'Flexbox Order', 'Transform: scale()'],
      correctAnswer: 1,
      explanation: 'Media queries `@media (min-width: ...)` allow stylesheets to adapt rules according to device display characteristics.'
    },
    {
      id: 'resp_3',
      skill: 'Responsive Design',
      question: 'In modern CSS, which layout module is best suited for 2-dimensional layouts (rows and columns simultaneously)?',
      options: ['Flexbox', 'CSS Grid', 'Float and Clearfix', 'Table Layout'],
      correctAnswer: 1,
      explanation: 'CSS Grid is designed specifically for 2D layouts (rows + columns), whereas Flexbox is primarily 1-dimensional.'
    }
  ],
  'JavaScript': [
    {
      id: 'js_1',
      skill: 'JavaScript',
      question: 'What is the output of `typeof null` in JavaScript?',
      options: ['"null"', '"object"', '"undefined"', '"number"'],
      correctAnswer: 1,
      explanation: '`typeof null === "object"` is a legacy bug in JavaScript from its first implementation that remains for backward compatibility.'
    },
    {
      id: 'js_2',
      skill: 'JavaScript',
      question: 'What is the main difference between `let` and `var` declaration in JavaScript?',
      options: [
        'let is function-scoped while var is block-scoped',
        'let is block-scoped while var is function-scoped',
        'var cannot be reassigned while let can',
        'There is no difference'
      ],
      correctAnswer: 1,
      explanation: '`let` and `const` adhere to block scoping `{ ... }`, whereas `var` is hoisted and function-scoped.'
    },
    {
      id: 'js_3',
      skill: 'JavaScript',
      question: 'What does `Promise.all([p1, p2])` do if one of the promises rejects?',
      options: [
        'Waits for all other promises to finish before resolving',
        'Immediately rejects with the reason of the first rejected promise',
        'Ignores the rejected promise and returns successful ones',
        'Converts rejection into null'
      ],
      correctAnswer: 1,
      explanation: '`Promise.all` fails fast: if any input promise rejects, the returned promise immediately rejects.'
    }
  ],
  'HTML5': [
    {
      id: 'html_1',
      skill: 'HTML5',
      question: 'Which semantic HTML5 tag should be used to wrap major navigation links?',
      options: ['<nav>', '<header>', '<menu>', '<section>'],
      correctAnswer: 0,
      explanation: 'The `<nav>` element is designated for navigation sections containing links to pages or within the page.'
    },
    {
      id: 'html_2',
      skill: 'HTML5',
      question: 'Which attribute in HTML forms enforces client-side field entry before submission?',
      options: ['validate="true"', 'required', 'mandatory', 'not-null'],
      correctAnswer: 1,
      explanation: 'The boolean `required` attribute prevents form submission if the input is empty.'
    }
  ],
  'CSS3': [
    {
      id: 'css_1',
      skill: 'CSS3',
      question: 'In the CSS Box Model, which property controls the space between the element border and surrounding elements?',
      options: ['padding', 'margin', 'outline', 'border-spacing'],
      correctAnswer: 1,
      explanation: '`margin` creates exterior clearance around the border, while `padding` creates interior clearance inside the border.'
    },
    {
      id: 'css_2',
      skill: 'CSS3',
      question: 'What does `box-sizing: border-box;` do in CSS?',
      options: [
        'Adds extra borders to boxes',
        'Includes padding and border in the element\'s specified total width and height',
        'Excludes padding from the total width calculation',
        'Rounds the box corners'
      ],
      correctAnswer: 1,
      explanation: '`border-box` ensures width and height include content, padding, and border, preventing layout overflow.'
    }
  ],
  'React': [
    {
      id: 'react_1',
      skill: 'React',
      question: 'Which React Hook should be used to perform side effects such as data fetching or subscriptions?',
      options: ['useState', 'useEffect', 'useMemo', 'useReducer'],
      correctAnswer: 1,
      explanation: '`useEffect` runs side effects after rendering and can depend on specified reactive dependencies.'
    },
    {
      id: 'react_2',
      skill: 'React',
      question: 'What is the primary benefit of React Virtual DOM?',
      options: [
        'Directly manipulates browser DOM without caching',
        'Minimizes expensive real DOM manipulations through diffing and batching',
        'Replaces HTML with XML natively',
        'Runs React code inside a Web Worker'
      ],
      correctAnswer: 1,
      explanation: 'The Virtual DOM compares previous and current UI trees, applying minimal efficient patches to the real browser DOM.'
    },
    {
      id: 'react_3',
      skill: 'React',
      question: 'Why should keys in React lists be unique and stable across re-renders?',
      options: [
        'To speed up CSS styling',
        'To help React identify which items have changed, been added, or been removed',
        'To enforce index-based sorting',
        'Keys are required only for styling tables'
      ],
      correctAnswer: 1,
      explanation: 'Keys give elements a stable identity so React reconciles lists efficiently without resetting internal component states.'
    }
  ],
  'Node.js': [
    {
      id: 'node_1',
      skill: 'Node.js',
      question: 'What mechanism does Node.js use to perform non-blocking I/O operations despite being single-threaded?',
      options: [
        'Multi-threading on CPU cores for JS code',
        'The Event Loop backed by the libuv library',
        'Synchronous blocking queues',
        'Browser IPC handles all networking'
      ],
      correctAnswer: 1,
      explanation: 'Node.js uses the V8 engine and libuv event loop to offload I/O operations to operating system worker threads.'
    },
    {
      id: 'node_2',
      skill: 'Node.js',
      question: 'Which core module is used to handle file system interactions in Node.js?',
      options: ['http', 'fs', 'path', 'os'],
      correctAnswer: 1,
      explanation: 'The `fs` module provides both asynchronous (fs.promises) and synchronous file read/write methods.'
    }
  ],
  'MongoDB': [
    {
      id: 'mongo_1',
      skill: 'MongoDB',
      question: 'What data format does MongoDB use internally to store documents with binary representations?',
      options: ['JSON', 'BSON', 'YAML', 'XML'],
      correctAnswer: 1,
      explanation: 'MongoDB stores records as BSON (Binary JSON), supporting extra data types like Date, Decimal128, and ObjectId.'
    },
    {
      id: 'mongo_2',
      skill: 'MongoDB',
      question: 'Which method is used in MongoDB to process data records through a multi-stage transformation pipeline?',
      options: ['aggregate()', 'find()', 'mapReduce()', 'transform()'],
      correctAnswer: 0,
      explanation: 'The `aggregate()` pipeline processes documents through ordered stages like $match, $group, $project, and $sort.'
    }
  ],
  'MySQL': [
    {
      id: 'mysql_1',
      skill: 'MySQL',
      question: 'Which clause in SQL is used to prevent duplicate rows from being returned in the result set?',
      options: ['UNIQUE', 'DISTINCT', 'GROUP BY ALL', 'FILTER'],
      correctAnswer: 1,
      explanation: '`SELECT DISTINCT column FROM table` eliminates duplicate values from the output result set.'
    },
    {
      id: 'mysql_2',
      skill: 'MySQL',
      question: 'What type of JOIN returns all records from the left table, and matched records from the right table?',
      options: ['INNER JOIN', 'LEFT JOIN (LEFT OUTER JOIN)', 'RIGHT JOIN', 'CROSS JOIN'],
      correctAnswer: 1,
      explanation: 'LEFT JOIN returns all rows from the left table; unmatched rows from the right table contain NULL values.'
    }
  ],
  'SQL': [
    {
      id: 'sql_1',
      skill: 'SQL',
      question: 'Which SQL clause is used to filter records after an aggregate `GROUP BY` operation?',
      options: ['WHERE', 'HAVING', 'FILTER', 'ORDER BY'],
      correctAnswer: 1,
      explanation: '`HAVING` filters aggregated group results (e.g. HAVING count(*) > 5), whereas `WHERE` filters rows before grouping.'
    }
  ],
  'Docker': [
    {
      id: 'docker_1',
      skill: 'Docker',
      question: 'What is the key difference between a Docker Image and a Docker Container?',
      options: [
        'A container is a read-only blueprint, an image is a running instance',
        'An image is a read-only template; a container is a runnable, isolated instance of an image',
        'Images only run on Linux, containers run on Windows',
        'There is no difference'
      ],
      correctAnswer: 1,
      explanation: 'A Docker image contains application code, binaries, and libraries; a container is the running process layer on top.'
    },
    {
      id: 'docker_2',
      skill: 'Docker',
      question: 'Which file is used to define and run multi-container Docker applications simultaneously?',
      options: ['Dockerfile', 'docker-compose.yml', 'package.json', 'container.config'],
      correctAnswer: 1,
      explanation: 'Docker Compose uses `docker-compose.yml` to orchestrate multi-container services, networks, and volumes.'
    }
  ],
  'Git': [
    {
      id: 'git_1',
      skill: 'Git',
      question: 'Which Git command is used to combine changes from a feature branch into the current active branch?',
      options: ['git push', 'git merge', 'git pull', 'git rebase --abort'],
      correctAnswer: 1,
      explanation: '`git merge <branch>` integrates independent lines of development into the current checked-out branch.'
    }
  ],
  'Java': [
    {
      id: 'java_1',
      skill: 'Java',
      question: 'Which collection interface in Java guarantees unique elements and no duplicate values?',
      options: ['List', 'Set', 'Queue', 'ArrayList'],
      correctAnswer: 1,
      explanation: 'The `Set` interface (such as HashSet, TreeSet) does not allow duplicate elements.'
    },
    {
      id: 'java_2',
      skill: 'Java',
      question: 'What does the `finally` block in Java exception handling accomplish?',
      options: [
        'Executes only if an exception is thrown',
        'Always executes regardless of whether an exception is thrown or caught',
        'Executes only if no exception occurs',
        'Terminates the JVM immediately'
      ],
      correctAnswer: 1,
      explanation: 'The `finally` block always executes to clean up resources (such as closing database connections or file streams).'
    }
  ],
  'Spring Boot': [
    {
      id: 'spring_1',
      skill: 'Spring Boot',
      question: 'Which annotation in Spring Boot combines @Controller and @ResponseBody for REST endpoints?',
      options: ['@Service', '@RestController', '@Component', '@Repository'],
      correctAnswer: 1,
      explanation: '@RestController marks the class as a request handler where every method returns a domain object serialized to JSON directly.'
    }
  ],
  'Python': [
    {
      id: 'py_1',
      skill: 'Python',
      question: 'What does a Python list comprehension `[x**2 for x in range(5) if x % 2 == 0]` evaluate to?',
      options: ['[0, 4, 16]', '[1, 9]', '[0, 2, 4]', '[0, 1, 4, 9, 16]'],
      correctAnswer: 0,
      explanation: 'The even numbers in range(5) are 0, 2, and 4. Squaring each yields 0, 4, and 16.'
    }
  ]
};

// General fallback questions
const GENERAL_QUESTIONS = [
  {
    id: 'gen_1',
    skill: 'RESTful APIs',
    question: 'Which HTTP method should be used to perform an idempotent update replacing a resource entirely?',
    options: ['POST', 'PUT', 'PATCH', 'GET'],
    correctAnswer: 1,
    explanation: 'PUT replaces an existing resource and is idempotent; multiple identical PUT requests produce the exact same outcome.'
  },
  {
    id: 'gen_2',
    skill: 'CI/CD',
    question: 'What is the main objective of Continuous Integration (CI)?',
    options: [
      'Automatically merge developer code into a shared repository frequently with automated tests',
      'Deploy code only once a year',
      'Manually inspect each line of code in meetings',
      'Replace version control systems'
    ],
    correctAnswer: 0,
    explanation: 'CI automatically validates code builds and runs automated test suites upon every commit to catch integration issues early.'
  },
  {
    id: 'gen_3',
    skill: 'System Design',
    question: 'What is the primary trade-off highlighted by the CAP theorem for distributed data stores?',
    options: [
      'Cost vs Performance vs Security',
      'Consistency vs Availability vs Partition Tolerance',
      'Compute vs Memory vs Disk',
      'Latency vs Bandwidth vs Packet Size'
    ],
    correctAnswer: 1,
    explanation: 'In the presence of a network partition (P), a distributed system can only guarantee either Consistency (C) or Availability (A), but not both.'
  },
  {
    id: 'gen_4',
    skill: 'Web Security',
    question: 'What security mechanism protects users by preventing unauthorized scripts from reading data from another origin?',
    options: ['Same-Origin Policy (SOP)', 'DNSSEC', 'TCP Handshake', 'Bcrypt Hashing'],
    correctAnswer: 0,
    explanation: 'The Same-Origin Policy is a fundamental browser security model that isolates potentially malicious documents.'
  },
  {
    id: 'gen_5',
    skill: 'Software Architecture',
    question: 'Which design pattern provides a single point of entry for client requests in a microservices system?',
    options: ['API Gateway', 'Factory Pattern', 'Observer Pattern', 'Singleton Pattern'],
    correctAnswer: 0,
    explanation: 'An API Gateway acts as a reverse proxy to route requests, enforce authentication, and aggregate microservices responses.'
  }
];

/**
 * Generates an MCQ quiz tailored to a list of target skills
 */
function generateQuiz(targetSkills = [], count = 5) {
  const selectedQuestions = [];
  const addedIds = new Set();

  // Normalize target skill names
  const normalizedTargets = targetSkills.map(s => {
    if (typeof s === 'string') return s;
    return s.name || '';
  }).filter(Boolean);

  // 1. Pick questions matching target skills
  for (const skillName of normalizedTargets) {
    // Try exact or partial match in QUESTION_BANK
    let pool = QUESTION_BANK[skillName];
    if (!pool) {
      // Find key case-insensitively
      const matchingKey = Object.keys(QUESTION_BANK).find(k => k.toLowerCase() === skillName.toLowerCase());
      if (matchingKey) pool = QUESTION_BANK[matchingKey];
    }

    if (pool && pool.length > 0) {
      for (const q of pool) {
        if (!addedIds.has(q.id)) {
          selectedQuestions.push(q);
          addedIds.add(q.id);
          if (selectedQuestions.length >= count) break;
        }
      }
    }
    if (selectedQuestions.length >= count) break;
  }

  // 2. If still below target count, fill from general bank
  if (selectedQuestions.length < count) {
    for (const q of GENERAL_QUESTIONS) {
      if (!addedIds.has(q.id)) {
        selectedQuestions.push(q);
        addedIds.add(q.id);
        if (selectedQuestions.length >= count) break;
      }
    }
  }

  // 3. If still below count, generate dynamic technical questions for target skill
  let fallbackCounter = 1;
  while (selectedQuestions.length < count) {
    const fallbackSkill = normalizedTargets[0] || 'Web Development';
    const dynId = 'dyn_' + Date.now() + '_' + fallbackCounter++;
    const dynamicQ = {
      id: dynId,
      skill: fallbackSkill,
      question: `Which industry best practice is essential when implementing ${fallbackSkill} in production?`,
      options: [
        `Implement automated testing, logging, and input validation for ${fallbackSkill}`,
        'Disable all security headers to reduce response latency',
        'Store plain-text credentials in the frontend codebase',
        'Avoid documentation and version control'
      ],
      correctAnswer: 0,
      explanation: `Following automated test suites, input validation, and proper logging ensures resilient ${fallbackSkill} implementations.`
    };
    selectedQuestions.push(dynamicQ);
    addedIds.add(dynId);
  }

  return {
    quizId: 'quiz_' + Date.now(),
    skillsTested: [...new Set(selectedQuestions.map(q => q.skill))],
    totalQuestions: selectedQuestions.length,
    questions: selectedQuestions.map((q, idx) => ({
      index: idx + 1,
      id: q.id,
      skill: q.skill,
      question: q.question,
      options: q.options
    })),
    _solutions: selectedQuestions.map(q => ({
      id: q.id,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation
    }))
  };
}

/**
 * Evaluates submitted user answers against true solutions
 */
function evaluateQuiz(userAnswers = [], solutions = []) {
  const ansMap = new Map();
  userAnswers.forEach(a => {
    ansMap.set(a.questionId, a.selectedOption);
  });

  let correctCount = 0;
  const detailedResults = [];

  // Evaluate against every question in the quiz solutions
  for (const sol of solutions) {
    const userSelected = ansMap.get(sol.id);
    const isAnswered = userSelected !== undefined && userSelected !== null;
    const isCorrect = isAnswered && userSelected === sol.correctAnswer;

    if (isCorrect) correctCount++;

    detailedResults.push({
      questionId: sol.id,
      userAnswer: isAnswered ? userSelected : null,
      correctAnswer: sol.correctAnswer,
      isCorrect,
      explanation: sol.explanation
    });
  }

  const total = solutions.length || 1;
  const accuracyPercentage = Math.round((correctCount / total) * 100);

  let feedback = 'Good attempt! Review the questions you missed and check out the learning roadmap.';
  if (accuracyPercentage >= 80) {
    feedback = 'Outstanding mastery! You demonstrated strong technical command of these skills.';
  } else if (accuracyPercentage >= 60) {
    feedback = 'Solid performance! A few concepts need a quick refresher before job interviews.';
  }

  return {
    totalQuestions: total,
    correctCount,
    accuracyPercentage,
    feedback,
    results: detailedResults
  };
}

module.exports = {
  generateQuiz,
  evaluateQuiz,
  QUESTION_BANK,
  GENERAL_QUESTIONS
};
