CREATE TABLE auth_bypass_favorites (
    id SERIAL PRIMARY KEY, 
    favorite_text varchar(180), 
    user_id INTEGER REFERENCES auth_bypass_users ON DELETE CASCADE
);