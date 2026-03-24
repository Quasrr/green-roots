INSERT INTO "user" ("lastname", "firstname", "email", "password", "roleId")
SELECT
    'Admin',
    'Super',
    'admin@greenroots.fr',
    '$argon2id$v=19$m=65536,t=3,p=4$/+jLxGpQiV36vSqkWegmjw$aFYkFxEYc0pc4FbEXbz8kKF/jt83Qc53YNkQMALTJC0',
    "Role"."id"
FROM "Role"
WHERE "Role"."nameRole" = 'admin'
AND NOT EXISTS (
    SELECT 1
    FROM "user"
    WHERE "email" = 'admin@greenroots.fr'
);
