-- CloudNova balance and referral schema.
-- The current service uses in-memory arrays; this is the persistence contract for a database adapter.

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  referral_code TEXT NOT NULL UNIQUE,
  referred_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  vip_level TEXT NOT NULL DEFAULT 'Bronze',
  paused INTEGER NOT NULL DEFAULT 0,
  promo_failed_attempts INTEGER NOT NULL DEFAULT 0,
  promo_locked_until TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE wallets (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  balance NUMERIC NOT NULL DEFAULT 0,
  base_hashrate NUMERIC NOT NULL DEFAULT 10,
  effective_hashrate NUMERIC NOT NULL DEFAULT 10,
  miners_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE mining_contracts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL,
  cost NUMERIC NOT NULL CHECK (cost > 0),
  daily_income NUMERIC NOT NULL CHECK (daily_income > 0),
  duration_days INTEGER NOT NULL CHECK (duration_days > 0),
  hashrate NUMERIC NOT NULL CHECK (hashrate > 0),
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  last_collected_at TEXT NOT NULL
);

CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  network TEXT,
  txid TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'rejected')),
  source_transaction_id TEXT REFERENCES transactions(id),
  rate NUMERIC,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE promo_codes (
  code TEXT PRIMARY KEY,
  reward NUMERIC NOT NULL CHECK (reward > 0),
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE promo_claims (
  code TEXT NOT NULL REFERENCES promo_codes(code) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reward NUMERIC NOT NULL,
  claimed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (code, user_id)
);

CREATE TABLE reward_logs (
  id TEXT PRIMARY KEY,
  source_transaction_id TEXT NOT NULL REFERENCES transactions(id),
  beneficiary_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 3),
  rate NUMERIC NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX transactions_user_status_idx ON transactions(user_id, status);
CREATE INDEX users_referred_by_idx ON users(referred_by);