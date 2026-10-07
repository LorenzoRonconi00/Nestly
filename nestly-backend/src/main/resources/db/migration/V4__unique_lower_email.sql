UPDATE users
SET
    email = lower(email)
WHERE
    email <> lower(email);

CREATE UNIQUE INDEX idx_users_email_lower ON users (lower(email));