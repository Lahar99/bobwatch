/**
 * Test File with Known Vulnerabilities
 * 
 * This file contains intentional security vulnerabilities for testing
 * the BobWatch Wrapper's detection and remediation capabilities.
 * 
 * DO NOT USE IN PRODUCTION!
 */

// VULNERABILITY 1: Exposed Secret
const API_KEY = "sk-1234567890abcdefghijklmnopqrstuvwxyz";
const DATABASE_PASSWORD = "admin123";

// VULNERABILITY 2: SQL Injection
function getUserByUsername(username) {
  const query = `SELECT * FROM users WHERE username = '${username}'`;
  return db.query(query);
}

// VULNERABILITY 3: Command Injection
function executeCommand(userInput) {
  const command = `ls -la ${userInput}`;
  return exec(command);
}

// VULNERABILITY 4: Path Traversal
function readUserFile(filename) {
  const filePath = `/uploads/${filename}`;
  return fs.readFileSync(filePath, 'utf8');
}

// VULNERABILITY 5: XSS Vulnerability
function renderUserComment(comment) {
  document.getElementById('comments').innerHTML = comment;
}

// VULNERABILITY 6: Hardcoded Credentials
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'password123',
  database: 'myapp'
};

// VULNERABILITY 7: Insecure Authentication
function authenticate(username, password) {
  if (username === 'admin' && password === 'admin') {
    return true;
  }
  return false;
}

module.exports = {
  getUserByUsername,
  executeCommand,
  readUserFile,
  renderUserComment,
  authenticate
};

// Made with Bob
