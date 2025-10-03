const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('multilingual_chat.db');

async function updatePassword() {
  const hash = await bcrypt.hash('password123', 10);
  
  db.run('UPDATE users SET password_hash = ? WHERE username = ?', [hash, 'koshai'], (err) => {
    if (err) {
      console.error('Error:', err);
    } else {
      console.log('Password updated successfully for user: koshai');
      console.log('You can now login with:');
      console.log('Username: koshai');
      console.log('Password: password123');
    }
    db.close();
  });
}

updatePassword();
