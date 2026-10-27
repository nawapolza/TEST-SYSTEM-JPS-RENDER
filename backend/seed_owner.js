require('dotenv').config();
const crypto = require('crypto');
const { promisify } = require('util');
const derivePassword = promisify(crypto.scrypt);
async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = await derivePassword(password, salt, 64);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}
const { MongoClient } = require('mongodb');
const config = require('./config');

// Legacy authorization checks use owner/employee internally. The UI labels these Admin/User.
// Seed inserts only missing accounts; it never resets passwords or overwrites existing accounts.
async function main() {
  if (!config.mongodb.uri) throw new Error('MONGODB_URI is not set');
  const client = new MongoClient(config.mongodb.uri, { serverSelectionTimeoutMS: 12000 });
  await client.connect();
  try {
    const db = client.db(config.mongodb.db);
    const now = new Date().toISOString();
    const accounts = [
      { username: 'admin', name: 'ผู้ดูแลระบบ JPS', role: 'owner', password: process.env.SEED_ADMIN_PASSWORD || 'admim.admim' },
      { username: 'test', name: 'ผู้ใช้งานทดสอบ', role: 'employee', password: process.env.SEED_USER_PASSWORD || 'test' },
    ];
    for (const item of accounts) {
      const existing = await db.collection('users').findOne({ username: item.username });
      if (existing) {
        console.log(`SKIP ${item.username}: account already exists; password/role unchanged.`);
        continue;
      }
      if (Buffer.byteLength(item.password, 'utf8') > 4096) throw new Error(`Password too long for ${item.username}`);
      await db.collection('users').insertOne({
        username: item.username, name: item.name, role: item.role,
        phone: '', password_hash: await hashPassword(item.password), is_active: 1,
        auth_version: 1, created_at: now, updated_at: now,
      });
      console.log(`CREATED ${item.username} (${item.role === 'owner' ? 'Admin' : 'User'})`);
    }
    for (const item_type of ['ดีเซล', 'น้ำมันเครื่อง', 'แอดบลู']) {
      await db.collection('stocks').updateOne(
        { item_type },
        { $setOnInsert: { item_type, balance_liters: 0, created_at: now }, $set: { updated_at: now } },
        { upsert: true },
      );
    }
    console.log(`Seed complete for database: ${config.mongodb.db}`);
    console.log('Security: change default passwords after first login. Existing accounts were not reset.');
  } finally {
    await client.close();
  }
}
main().catch((err) => { console.error(err.message || err); process.exit(1); });
