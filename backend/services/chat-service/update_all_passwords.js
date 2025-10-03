const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('multilingual_chat.db');

const userPasswords = [
  { username: 'demo', password: 'demo123' },
  { username: 'admin', password: 'admin123' },
  { username: 'guest', password: 'guest123' },
  { username: 'host', password: 'host123' },
  { username: 'user1', password: 'user123' },
  { username: 'bob', password: 'bob123' }
];

async function updateAllPasswords() {
  console.log('Updating passwords for all users...\n');
  
  for (const user of userPasswords) {
    const hash = await bcrypt.hash(user.password, 10);
    
    await new Promise((resolve, reject) => {
      db.run('UPDATE users SET password_hash = ? WHERE username = ?', [hash, user.username], (err) => {
        if (err) {
          console.error(`Error updating ${user.username}:`, err);
          reject(err);
        } else {
          console.log(`✅ ${user.username} - password: ${user.password}`);
          resolve();
        }
      });
    });
  }
  
  console.log('\n✅ All passwords updated successfully!');
  db.close();
}

updateAllPasswords().catch(console.error);
