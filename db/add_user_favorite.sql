INSERT INTO auth_bypass_favorites
(favorite_text, user_id)
VALUES
($2, $1);

SELECT * from auth_bypass_favorites
WHERE user_id = $1;
