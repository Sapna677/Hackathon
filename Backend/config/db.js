const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial DB template
const defaultDbStructure = {
  users: [],
  resumes: [],
  jobDescriptions: [],
  analyses: [],
  roadmaps: [],
  quizzes: [],
  progress: []
};

// Initialize DB file if not present
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(defaultDbStructure, null, 2));
}

class JsonDatabase {
  constructor() {
    this.filePath = DB_FILE;
  }

  read() {
    try {
      const content = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(content);
    } catch (err) {
      console.error('Error reading JSON DB:', err.message);
      return defaultDbStructure;
    }
  }

  write(data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (err) {
      console.error('Error writing to JSON DB:', err.message);
      return false;
    }
  }

  // Collection helpers
  find(collectionName, query = {}) {
    const db = this.read();
    const list = db[collectionName] || [];
    return list.filter(item => {
      return Object.keys(query).every(key => item[key] === query[key]);
    });
  }

  findOne(collectionName, query = {}) {
    const db = this.read();
    const list = db[collectionName] || [];
    return list.find(item => {
      return Object.keys(query).every(key => item[key] === query[key]);
    }) || null;
  }

  insert(collectionName, record) {
    const db = this.read();
    if (!db[collectionName]) db[collectionName] = [];
    
    if (!record.id) {
      record.id = 'id_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    }
    record.createdAt = record.createdAt || new Date().toISOString();
    record.updatedAt = new Date().toISOString();

    db[collectionName].push(record);
    this.write(db);
    return record;
  }

  update(collectionName, query, updates) {
    const db = this.read();
    const list = db[collectionName] || [];
    const index = list.findIndex(item => {
      return Object.keys(query).every(key => item[key] === query[key]);
    });

    if (index === -1) return null;
    
    list[index] = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    db[collectionName] = list;
    this.write(db);
    return list[index];
  }
}

const dbInstance = new JsonDatabase();

module.exports = {
  db: dbInstance
};
