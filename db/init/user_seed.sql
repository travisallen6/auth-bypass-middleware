CREATE TABLE auth_bypass_users (
    id SERIAL PRIMARY KEY, 
    auth_id TEXT, 
    user_name VARCHAR(180),
    user_pic TEXT
);