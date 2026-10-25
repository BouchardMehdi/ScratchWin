-- Initialisation non destructive, appliquee par le gestionnaire de migrations.
CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(120) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  credits DECIMAL(10, 2) NOT NULL DEFAULT 50.00,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_username (username),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tickets (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  max_reward DECIMAL(10, 2) NOT NULL,
  win_probability DECIMAL(5, 2) NOT NULL,
  ticket_type VARCHAR(50) NOT NULL,
  description TEXT,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_tickets_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ticket_rewards (
  id INT NOT NULL AUTO_INCREMENT,
  ticket_id INT NOT NULL,
  label VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  weight INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_ticket_rewards_ticket_id (ticket_id),
  CONSTRAINT fk_ticket_rewards_ticket
    FOREIGN KEY (ticket_id) REFERENCES tickets (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS games (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  ticket_id INT NOT NULL,
  cost DECIMAL(10, 2) NOT NULL,
  is_win TINYINT(1) NOT NULL DEFAULT 0,
  reward DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  result_data JSON DEFAULT NULL,
  played_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_games_user_id (user_id),
  KEY idx_games_ticket_id (ticket_id),
  KEY idx_games_played_at (played_at),
  CONSTRAINT fk_games_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_games_ticket
    FOREIGN KEY (ticket_id) REFERENCES tickets (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  token_hash VARCHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_refresh_tokens_token_hash (token_hash),
  KEY idx_refresh_tokens_user_id (user_id),
  KEY idx_refresh_tokens_expires_at (expires_at),
  CONSTRAINT fk_refresh_tokens_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO tickets (id, name, slug, price, max_reward, win_probability, ticket_type, description, is_active)
VALUES
  (1, 'Flash', 'flash', 2.00, 20.00, 35.00, 'instant', 'Ticket peu cher avec petits gains et probabilite moyenne.', 1),
  (2, 'Fortune', 'fortune', 5.00, 75.00, 22.00, 'instant', 'Ticket intermediaire avec gains moyens.', 1),
  (3, 'Jackpot', 'jackpot', 10.00, 250.00, 10.00, 'instant', 'Ticket plus cher avec gros gain possible.', 1),
  (4, 'Mystere', 'mystere', 4.00, 100.00, 18.00, 'multi_reward', 'Ticket aleatoire avec plusieurs paliers de gains.', 1),
  (5, 'Lucky 7', 'lucky-7', 3.00, 50.00, 20.00, 'symbols', 'Ticket base sur la revelation de symboles.', 1);

INSERT INTO ticket_rewards (ticket_id, label, amount, weight)
SELECT t.id, 'Petit gain', 2.00, 50 FROM tickets t
WHERE t.slug = 'flash' AND NOT EXISTS (
  SELECT 1 FROM ticket_rewards r WHERE r.ticket_id = t.id AND r.amount = 2.00
);

INSERT INTO ticket_rewards (ticket_id, label, amount, weight)
SELECT t.id, 'Gain moyen', 5.00, 30 FROM tickets t
WHERE t.slug = 'flash' AND NOT EXISTS (
  SELECT 1 FROM ticket_rewards r WHERE r.ticket_id = t.id AND r.amount = 5.00
);

INSERT INTO ticket_rewards (ticket_id, label, amount, weight)
SELECT t.id, 'Gros gain', 10.00, 15 FROM tickets t
WHERE t.slug = 'flash' AND NOT EXISTS (
  SELECT 1 FROM ticket_rewards r WHERE r.ticket_id = t.id AND r.amount = 10.00
);

INSERT INTO ticket_rewards (ticket_id, label, amount, weight)
SELECT t.id, 'Max gain', 20.00, 5 FROM tickets t
WHERE t.slug = 'flash' AND NOT EXISTS (
  SELECT 1 FROM ticket_rewards r WHERE r.ticket_id = t.id AND r.amount = 20.00
);

INSERT INTO ticket_rewards (ticket_id, label, amount, weight)
SELECT t.id, 'Petit gain', 5.00, 45 FROM tickets t
WHERE t.slug = 'fortune' AND NOT EXISTS (
  SELECT 1 FROM ticket_rewards r WHERE r.ticket_id = t.id AND r.amount = 5.00
);

INSERT INTO ticket_rewards (ticket_id, label, amount, weight)
SELECT t.id, 'Gain moyen', 15.00, 30 FROM tickets t
WHERE t.slug = 'fortune' AND NOT EXISTS (
  SELECT 1 FROM ticket_rewards r WHERE r.ticket_id = t.id AND r.amount = 15.00
);

INSERT INTO ticket_rewards (ticket_id, label, amount, weight)
SELECT t.id, 'Gros gain', 30.00, 18 FROM tickets t
WHERE t.slug = 'fortune' AND NOT EXISTS (
  SELECT 1 FROM ticket_rewards r WHERE r.ticket_id = t.id AND r.amount = 30.00
);

INSERT INTO ticket_rewards (ticket_id, label, amount, weight)
SELECT t.id, 'Max gain', 75.00, 7 FROM tickets t
WHERE t.slug = 'fortune' AND NOT EXISTS (
  SELECT 1 FROM ticket_rewards r WHERE r.ticket_id = t.id AND r.amount = 75.00
);

INSERT INTO ticket_rewards (ticket_id, label, amount, weight)
SELECT t.id, 'Petit gain', 10.00, 50 FROM tickets t
WHERE t.slug = 'jackpot' AND NOT EXISTS (
  SELECT 1 FROM ticket_rewards r WHERE r.ticket_id = t.id AND r.amount = 10.00
);

INSERT INTO ticket_rewards (ticket_id, label, amount, weight)
SELECT t.id, 'Gain moyen', 25.00, 25 FROM tickets t
WHERE t.slug = 'jackpot' AND NOT EXISTS (
  SELECT 1 FROM ticket_rewards r WHERE r.ticket_id = t.id AND r.amount = 25.00
);

INSERT INTO ticket_rewards (ticket_id, label, amount, weight)
SELECT t.id, 'Gros gain', 100.00, 20 FROM tickets t
WHERE t.slug = 'jackpot' AND NOT EXISTS (
  SELECT 1 FROM ticket_rewards r WHERE r.ticket_id = t.id AND r.amount = 100.00
);

INSERT INTO ticket_rewards (ticket_id, label, amount, weight)
SELECT t.id, 'Max gain', 250.00, 5 FROM tickets t
WHERE t.slug = 'jackpot' AND NOT EXISTS (
  SELECT 1 FROM ticket_rewards r WHERE r.ticket_id = t.id AND r.amount = 250.00
);

INSERT INTO ticket_rewards (ticket_id, label, amount, weight)
SELECT t.id, 'Mini surprise', 4.00, 35 FROM tickets t
WHERE t.slug = 'mystere' AND NOT EXISTS (
  SELECT 1 FROM ticket_rewards r WHERE r.ticket_id = t.id AND r.amount = 4.00
);

INSERT INTO ticket_rewards (ticket_id, label, amount, weight)
SELECT t.id, 'Bonne surprise', 12.00, 30 FROM tickets t
WHERE t.slug = 'mystere' AND NOT EXISTS (
  SELECT 1 FROM ticket_rewards r WHERE r.ticket_id = t.id AND r.amount = 12.00
);

INSERT INTO ticket_rewards (ticket_id, label, amount, weight)
SELECT t.id, 'Tres bonne surprise', 35.00, 20 FROM tickets t
WHERE t.slug = 'mystere' AND NOT EXISTS (
  SELECT 1 FROM ticket_rewards r WHERE r.ticket_id = t.id AND r.amount = 35.00
);

INSERT INTO ticket_rewards (ticket_id, label, amount, weight)
SELECT t.id, 'Surprise max', 100.00, 15 FROM tickets t
WHERE t.slug = 'mystere' AND NOT EXISTS (
  SELECT 1 FROM ticket_rewards r WHERE r.ticket_id = t.id AND r.amount = 100.00
);

INSERT INTO ticket_rewards (ticket_id, label, amount, weight)
SELECT t.id, 'Double 7', 6.00, 45 FROM tickets t
WHERE t.slug = 'lucky-7' AND NOT EXISTS (
  SELECT 1 FROM ticket_rewards r WHERE r.ticket_id = t.id AND r.amount = 6.00
);

INSERT INTO ticket_rewards (ticket_id, label, amount, weight)
SELECT t.id, 'Triple symbole', 15.00, 30 FROM tickets t
WHERE t.slug = 'lucky-7' AND NOT EXISTS (
  SELECT 1 FROM ticket_rewards r WHERE r.ticket_id = t.id AND r.amount = 15.00
);

INSERT INTO ticket_rewards (ticket_id, label, amount, weight)
SELECT t.id, 'Triple 7', 30.00, 18 FROM tickets t
WHERE t.slug = 'lucky-7' AND NOT EXISTS (
  SELECT 1 FROM ticket_rewards r WHERE r.ticket_id = t.id AND r.amount = 30.00
);

INSERT INTO ticket_rewards (ticket_id, label, amount, weight)
SELECT t.id, 'Lucky max', 50.00, 7 FROM tickets t
WHERE t.slug = 'lucky-7' AND NOT EXISTS (
  SELECT 1 FROM ticket_rewards r WHERE r.ticket_id = t.id AND r.amount = 50.00
);
