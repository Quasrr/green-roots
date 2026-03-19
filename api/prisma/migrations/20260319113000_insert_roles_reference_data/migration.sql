INSERT INTO "Role" ("nameRole")
VALUES
    ('admin'),
    ('user')
ON CONFLICT ("nameRole") DO NOTHING;
