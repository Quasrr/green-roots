INSERT INTO "Category" ("name")
VALUES
    ('Fruitier'),
    ('Ornemental'),
    ('Persistant')
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "Tree" (
    "name",
    "price",
    "description",
    "impact_co2",
    "impact_o2",
    "image",
    "quantity",
    "label",
    "country",
    "height",
    "growth",
    "exposition",
    "rusticity"
)
VALUES
    (
        'Pommier',
        29.9,
        'Le pommier est un arbre fruitier incontournable des jardins tempérés. Il offre une floraison délicate au printemps puis une récolte généreuse de pommes en fin d''été ou en automne. Facile à cultiver, il apprécie les expositions ensoleillées et les sols bien drainés.',
        25,
        18,
        'pommier.webp',
        20,
        'Arbre fruitier généreux',
        'France',
        4,
        'medium',
        'Soleil',
        '5-8'
    ),
    (
        'Cerisier',
        34.9,
        'Le cerisier séduit autant par sa magnifique floraison printanière que par sa production de cerises savoureuses. Il apporte une touche élégante au jardin et constitue un excellent choix pour les amateurs d''arbres fruitiers décoratifs et productifs.',
        22,
        17,
        'cerisier.webp',
        15,
        'Floraison et fruits gourmands',
        'France',
        5,
        'fast',
        'Soleil',
        '5-7'
    ),
    (
        'Olivier',
        49.9,
        'L''olivier est un arbre emblématique du bassin méditerranéen, apprécié pour son feuillage persistant argenté et son allure authentique. Il produit des olives et apporte immédiatement du caractère aux jardins, terrasses et espaces ensoleillés.',
        18,
        14,
        'olivier.webp',
        10,
        'Esprit méditerranéen persistant',
        'Italie',
        6,
        'slow',
        'Soleil',
        '8-10'
    ),
    (
        'Erable du Japon',
        59.9,
        'L''érable du Japon est un arbre ornemental raffiné, très recherché pour son feuillage finement découpé et ses couleurs spectaculaires au fil des saisons. Il convient parfaitement aux jardins élégants, aux petits espaces et aux zones mi-ombragées.',
        15,
        12,
        'erable-japon.webp',
        8,
        'Feuillage décoratif remarquable',
        'Japon',
        3,
        'slow',
        'Mi-ombre',
        '5-8'
    ),
    (
        'Magnolia',
        44.9,
        'Le magnolia est un arbre ornemental apprécié pour sa floraison spectaculaire et parfumée. Ses grandes fleurs apportent une présence majestueuse au jardin dès le printemps, faisant de lui un excellent choix pour embellir les espaces extérieurs.',
        17,
        13,
        'magnolia.webp',
        12,
        'Floraison élégante et parfumée',
        'Chine',
        5,
        'medium',
        'Soleil',
        '5-9'
    ),
    (
        'Pin',
        24.9,
        'Le pin est un conifère robuste au feuillage persistant, idéal pour structurer un jardin et apporter de la verdure toute l''année. Résistant et facile d''entretien, il s''adapte bien à de nombreux terrains et supporte des conditions climatiques variées.',
        30,
        22,
        'pin.webp',
        25,
        'Conifère robuste toute l''année',
        'France',
        10,
        'fast',
        'Soleil',
        '3-8'
    ),
    (
        'Sapin',
        27.9,
        'Le sapin est un conifère persistant apprécié pour son port élégant et son feuillage dense. Il trouve sa place aussi bien dans les grands jardins que dans les plantations paysagères, tout en offrant une excellente résistance au froid.',
        28,
        21,
        'sapin.webp',
        30,
        'Persistant résistant au froid',
        'Canada',
        12,
        'medium',
        'Soleil',
        '3-7'
    ),
    (
        'Chêne',
        39.9,
        'Le chêne est un grand arbre emblématique, reconnu pour sa longévité, sa solidité et sa prestance. Il constitue un excellent choix pour créer une structure durable dans le paysage et offre un habitat précieux pour la biodiversité.',
        35,
        26,
        'chene.webp',
        14,
        'Arbre majestueux et durable',
        'France',
        20,
        'slow',
        'Soleil',
        '4-8'
    ),
    (
        'Bouleau',
        31.9,
        'Le bouleau est un arbre ornemental élégant, facilement reconnaissable à son écorce claire et à son feuillage léger. Il apporte de la luminosité au jardin et convient particulièrement bien aux aménagements naturels ou contemporains.',
        19,
        15,
        'bouleau.webp',
        0,
        'Ecorce claire très élégante',
        'Europe',
        15,
        'fast',
        'Soleil',
        '3-7'
    ),
    (
        'Citronnier',
        42.9,
        'Le citronnier est un arbre fruitier apprécié pour son feuillage brillant, son parfum délicat et sa production de citrons. Il est idéal pour les régions douces ou la culture en pot, où il apporte une belle touche méditerranéenne.',
        16,
        13,
        'citronnier.webp',
        9,
        'Agrume parfumé et décoratif',
        'Espagne',
        4,
        'medium',
        'Soleil',
        '9-11'
    )
ON CONFLICT ("name") DO UPDATE SET
    "price" = EXCLUDED."price",
    "description" = EXCLUDED."description",
    "impact_co2" = EXCLUDED."impact_co2",
    "impact_o2" = EXCLUDED."impact_o2",
    "image" = EXCLUDED."image",
    "quantity" = EXCLUDED."quantity",
    "label" = EXCLUDED."label",
    "country" = EXCLUDED."country",
    "height" = EXCLUDED."height",
    "growth" = EXCLUDED."growth",
    "exposition" = EXCLUDED."exposition",
    "rusticity" = EXCLUDED."rusticity";

DELETE FROM "TreeCategory"
WHERE "treeId" IN (
    SELECT "id"
    FROM "Tree"
    WHERE "name" IN (
        'Pommier',
        'Cerisier',
        'Olivier',
        'Erable du Japon',
        'Magnolia',
        'Pin',
        'Sapin',
        'Chêne',
        'Bouleau',
        'Citronnier'
    )
);

INSERT INTO "TreeCategory" ("treeId", "categoryId")
SELECT t."id", c."id"
FROM "Tree" t
JOIN "Category" c ON c."name" = 'Fruitier'
WHERE t."name" = 'Pommier'
ON CONFLICT ("treeId", "categoryId") DO NOTHING;

INSERT INTO "TreeCategory" ("treeId", "categoryId")
SELECT t."id", c."id"
FROM "Tree" t
JOIN "Category" c ON c."name" = 'Fruitier'
WHERE t."name" = 'Cerisier'
ON CONFLICT ("treeId", "categoryId") DO NOTHING;

INSERT INTO "TreeCategory" ("treeId", "categoryId")
SELECT t."id", c."id"
FROM "Tree" t
JOIN "Category" c ON c."name" = 'Fruitier'
WHERE t."name" = 'Olivier'
ON CONFLICT ("treeId", "categoryId") DO NOTHING;

INSERT INTO "TreeCategory" ("treeId", "categoryId")
SELECT t."id", c."id"
FROM "Tree" t
JOIN "Category" c ON c."name" = 'Persistant'
WHERE t."name" = 'Olivier'
ON CONFLICT ("treeId", "categoryId") DO NOTHING;

INSERT INTO "TreeCategory" ("treeId", "categoryId")
SELECT t."id", c."id"
FROM "Tree" t
JOIN "Category" c ON c."name" = 'Ornemental'
WHERE t."name" = 'Erable du Japon'
ON CONFLICT ("treeId", "categoryId") DO NOTHING;

INSERT INTO "TreeCategory" ("treeId", "categoryId")
SELECT t."id", c."id"
FROM "Tree" t
JOIN "Category" c ON c."name" = 'Ornemental'
WHERE t."name" = 'Magnolia'
ON CONFLICT ("treeId", "categoryId") DO NOTHING;

INSERT INTO "TreeCategory" ("treeId", "categoryId")
SELECT t."id", c."id"
FROM "Tree" t
JOIN "Category" c ON c."name" = 'Persistant'
WHERE t."name" = 'Pin'
ON CONFLICT ("treeId", "categoryId") DO NOTHING;

INSERT INTO "TreeCategory" ("treeId", "categoryId")
SELECT t."id", c."id"
FROM "Tree" t
JOIN "Category" c ON c."name" = 'Persistant'
WHERE t."name" = 'Sapin'
ON CONFLICT ("treeId", "categoryId") DO NOTHING;

INSERT INTO "TreeCategory" ("treeId", "categoryId")
SELECT t."id", c."id"
FROM "Tree" t
JOIN "Category" c ON c."name" = 'Ornemental'
WHERE t."name" = 'Chêne'
ON CONFLICT ("treeId", "categoryId") DO NOTHING;

INSERT INTO "TreeCategory" ("treeId", "categoryId")
SELECT t."id", c."id"
FROM "Tree" t
JOIN "Category" c ON c."name" = 'Ornemental'
WHERE t."name" = 'Bouleau'
ON CONFLICT ("treeId", "categoryId") DO NOTHING;

INSERT INTO "TreeCategory" ("treeId", "categoryId")
SELECT t."id", c."id"
FROM "Tree" t
JOIN "Category" c ON c."name" = 'Fruitier'
WHERE t."name" = 'Citronnier'
ON CONFLICT ("treeId", "categoryId") DO NOTHING;
