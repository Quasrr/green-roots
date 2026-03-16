import { Growth } from "./generated/enums.ts";
import { RoleName } from "./generated/enums.ts";
import { prisma } from "../src/models/index.ts";
import argon2 from "argon2";

async function main() {
    // Roles
    const adminRole = await prisma.role.upsert({
        where: { nameRole: RoleName.admin },
        update: {},
        create: { nameRole: RoleName.admin },
    });

    const userRole = await prisma.role.upsert({
        where: { nameRole: RoleName.user },
        update: {},
        create: { nameRole: RoleName.user },
    });

    // Test user
    const testUserPassword = await argon2.hash("Test1234!");
    await prisma.user.upsert({
        where: { email: "test.user@greenroots.fr" },
        update: {
            lastname: "User",
            firstname: "Test",
            password: testUserPassword,
            roleId: userRole.id,
        },
        create: {
            lastname: "User",
            firstname: "Test",
            email: "test.user@greenroots.fr",
            password: testUserPassword,
            roleId: userRole.id,
        },
    });

    const adminUserPassword = await argon2.hash("Admin1234!");
    await prisma.user.upsert({
        where: { email: "admin@greenroots.fr" },
        update: {
            lastname: "Admin",
            firstname: "Super",
            password: adminUserPassword,
            roleId: adminRole.id,
        },
        create: {
            lastname: "Admin",
            firstname: "Super",
            email: "admin@greenroots.fr",
            password: adminUserPassword,
            roleId: adminRole.id,
        },
    });

    // Categories
    const fruitiers = await prisma.category.upsert({
        where: { name: "Fruitier" },
        update: {},
        create: { name: "Fruitier" },
    });

    const ornamentaux = await prisma.category.upsert({
        where: { name: "Ornemental" },
        update: {},
        create: { name: "Ornemental" },
    });

    const persistants = await prisma.category.upsert({
        where: { name: "Persistant" },
        update: {},
        create: { name: "Persistant" },
    });

    // Trees
    const trees = [
        {
            name: "Pommier",
            price: 29.9,
            description:
                "Le pommier est un arbre fruitier incontournable des jardins tempérés. Il offre une floraison délicate au printemps puis une récolte généreuse de pommes en fin d'été ou en automne. Facile à cultiver, il apprécie les expositions ensoleillées et les sols bien drainés.",
            impact_co2: 25,
            impact_o2: 18,
            image: "pommier.webp",
            quantity: 20,
            label: "Arbre fruitier généreux",
            country: "France",
            height: 4,
            growth: Growth.medium,
            exposition: "Soleil",
            rusticity: "5-8",
            categories: [fruitiers.id],
        },
        {
            name: "Cerisier",
            price: 34.9,
            description:
                "Le cerisier séduit autant par sa magnifique floraison printanière que par sa production de cerises savoureuses. Il apporte une touche élégante au jardin et constitue un excellent choix pour les amateurs d'arbres fruitiers décoratifs et productifs.",
            impact_co2: 22,
            impact_o2: 17,
            image: "cerisier.webp",
            quantity: 15,
            label: "Floraison et fruits gourmands",
            country: "France",
            height: 5,
            growth: Growth.fast,
            exposition: "Soleil",
            rusticity: "5-7",
            categories: [fruitiers.id],
        },
        {
            name: "Olivier",
            price: 49.9,
            description:
                "L'olivier est un arbre emblématique du bassin méditerranéen, apprécié pour son feuillage persistant argenté et son allure authentique. Il produit des olives et apporte immédiatement du caractère aux jardins, terrasses et espaces ensoleillés.",
            impact_co2: 18,
            impact_o2: 14,
            image: "olivier.webp",
            quantity: 10,
            label: "Esprit méditerranéen persistant",
            country: "Italie",
            height: 6,
            growth: Growth.slow,
            exposition: "Soleil",
            rusticity: "8-10",
            categories: [fruitiers.id, persistants.id],
        },
        {
            name: "Erable du Japon",
            price: 59.9,
            description:
                "L'érable du Japon est un arbre ornemental raffiné, très recherché pour son feuillage finement découpé et ses couleurs spectaculaires au fil des saisons. Il convient parfaitement aux jardins élégants, aux petits espaces et aux zones mi-ombragées.",
            impact_co2: 15,
            impact_o2: 12,
            image: "erable-japon.webp",
            quantity: 8,
            label: "Feuillage décoratif remarquable",
            country: "Japon",
            height: 3,
            growth: Growth.slow,
            exposition: "Mi-ombre",
            rusticity: "5-8",
            categories: [ornamentaux.id],
        },
        {
            name: "Magnolia",
            price: 44.9,
            description:
                "Le magnolia est un arbre ornemental apprécié pour sa floraison spectaculaire et parfumée. Ses grandes fleurs apportent une présence majestueuse au jardin dès le printemps, faisant de lui un excellent choix pour embellir les espaces extérieurs.",
            impact_co2: 17,
            impact_o2: 13,
            image: "magnolia.webp",
            quantity: 12,
            label: "Floraison élégante et parfumée",
            country: "Chine",
            height: 5,
            growth: Growth.medium,
            exposition: "Soleil",
            rusticity: "5-9",
            categories: [ornamentaux.id],
        },
        {
            name: "Pin",
            price: 24.9,
            description:
                "Le pin est un conifère robuste au feuillage persistant, idéal pour structurer un jardin et apporter de la verdure toute l'année. Résistant et facile d'entretien, il s'adapte bien à de nombreux terrains et supporte des conditions climatiques variées.",
            impact_co2: 30,
            impact_o2: 22,
            image: "pin.webp",
            quantity: 25,
            label: "Conifère robuste toute l'année",
            country: "France",
            height: 10,
            growth: Growth.fast,
            exposition: "Soleil",
            rusticity: "3-8",
            categories: [persistants.id],
        },
        {
            name: "Sapin",
            price: 27.9,
            description:
                "Le sapin est un conifère persistant apprécié pour son port élégant et son feuillage dense. Il trouve sa place aussi bien dans les grands jardins que dans les plantations paysagères, tout en offrant une excellente résistance au froid.",
            impact_co2: 28,
            impact_o2: 21,
            image: "sapin.webp",
            quantity: 30,
            label: "Persistant résistant au froid",
            country: "Canada",
            height: 12,
            growth: Growth.medium,
            exposition: "Soleil",
            rusticity: "3-7",
            categories: [persistants.id],
        },
        {
            name: "Chêne",
            price: 39.9,
            description:
                "Le chêne est un grand arbre emblématique, reconnu pour sa longévité, sa solidité et sa prestance. Il constitue un excellent choix pour créer une structure durable dans le paysage et offre un habitat précieux pour la biodiversité.",
            impact_co2: 35,
            impact_o2: 26,
            image: "chene.webp",
            quantity: 14,
            label: "Arbre majestueux et durable",
            country: "France",
            height: 20,
            growth: Growth.slow,
            exposition: "Soleil",
            rusticity: "4-8",
            categories: [ornamentaux.id],
        },
        {
            name: "Bouleau",
            price: 31.9,
            description:
                "Le bouleau est un arbre ornemental élégant, facilement reconnaissable à son écorce claire et à son feuillage léger. Il apporte de la luminosité au jardin et convient particulièrement bien aux aménagements naturels ou contemporains.",
            impact_co2: 19,
            impact_o2: 15,
            image: "bouleau.webp",
            quantity: 0,
            label: "Ecorce claire très élégante",
            country: "Europe",
            height: 15,
            growth: Growth.fast,
            exposition: "Soleil",
            rusticity: "3-7",
            categories: [ornamentaux.id],
        },
        {
            name: "Citronnier",
            price: 42.9,
            description:
                "Le citronnier est un arbre fruitier apprécié pour son feuillage brillant, son parfum délicat et sa production de citrons. Il est idéal pour les régions douces ou la culture en pot, où il apporte une belle touche méditerranéenne.",
            impact_co2: 16,
            impact_o2: 13,
            image: "citronnier.webp",
            quantity: 9,
            label: "Agrume parfumé et décoratif",
            country: "Espagne",
            height: 4,
            growth: Growth.medium,
            exposition: "Soleil",
            rusticity: "9-11",
            categories: [fruitiers.id],
        },
    ];

    for (const tree of trees) {
        const { categories, ...treeData } = tree;

        await prisma.tree.upsert({
            where: { name: treeData.name },
            update: {
                ...treeData,
                categories: {
                    deleteMany: {},
                    create: categories.map((categoryId) => ({
                        category: {
                            connect: { id: categoryId },
                        },
                    })),
                },
            },
            create: {
                ...treeData,
                categories: {
                    create: categories.map((categoryId) => ({
                        category: {
                            connect: { id: categoryId },
                        },
                    })),
                },
            },
        });
    }

    console.log(`Seed terminé`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
