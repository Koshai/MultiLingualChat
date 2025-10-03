-- Rename the old messages table
ALTER TABLE messages RENAME TO messages_old;

-- Create new messages table with meeting_id
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  meeting_id TEXT REFERENCES meetings(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id),
  content TEXT NOT NULL,
  original_language TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Copy old data if any (mapping room_id to meeting_id)
INSERT INTO messages SELECT * FROM messages_old;

-- Drop old table
DROP TABLE messages_old;
