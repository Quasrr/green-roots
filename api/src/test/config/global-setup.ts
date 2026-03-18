import type { Server } from "node:http";
import { after, before, beforeEach, type TestContext } from "node:test";
import express from "express";
import type { Request, Response, NextFunction } from "express";
import router from "../../routes.ts";
import { prisma } from "../../models/index.ts";
import redis from "../../models/redis.ts";

let server: Server;

// s'exécutes une seule fois pour tous les tests
before(async () => {
    await waitForDatabase();

    const app = express();
    app.use(express.json());
    app.use(parseCookies);
    app.use(router);

    server = await new Promise<Server>((resolve) => {
        const instance = app.listen(Number(process.env.PORT), () => resolve(instance));
    });
});

// s'exécutes à chaque tests
beforeEach(async (t) => {
    (t as TestContext).mock.method(console, "info", () => {});

    // vide les tables pour repartir d'une base vide à chaque test
    await truncateTables();

    // seed des rôles
    await prisma.role.createMany({
        data: [
            { id: 1, nameRole: "admin" },
            { id: 2, nameRole: "user" }
        ]
    });
});

// s'exécutes une seule fois après l'ensemble des tests
after(async () => {
    if (!server) {
        await redis.quit().catch(() => {});
        await prisma.$disconnect();
        return;
    }

    await new Promise<void>((resolve, reject) => {
        server.close((error) => {
            if (error) reject(error);
            else resolve();
        });
    });

    await redis.quit().catch(() => {});
    await prisma.$disconnect();
});

// vide complètement toutes les tables de la base de test avant chaque test, pour repartir d'un état propre
async function truncateTables() {
    // executeRawUnsafe permet à prisma d'exécuter une requête SQL brute directement dans Postgre sans pâsser par l'API Prisma
    await prisma.$executeRawUnsafe(`
        DO $$ DECLARE
          r RECORD;
        BEGIN
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
            EXECUTE 'TRUNCATE TABLE "' || r.tablename || '" RESTART IDENTITY CASCADE';
          END LOOP;
        END $$;
    `);
}

// attend que PostgreSQL soit réellement disponible avant de lancer les migrations et l'API
async function waitForDatabase() {
    for (let attempt = 0; attempt < 30; attempt += 1) {
        try {
            await prisma.$queryRawUnsafe("SELECT 1");

            return;
        } catch {
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }

    throw new Error("La base de donnée de test n'est pas disponible");
}

function parseCookies(req: Request, _res: Response, next: NextFunction) {
    const rawCookieHeader = req.headers.cookie;
    const cookies: Record<string, string> = {};

    if (rawCookieHeader) {
        for (const cookiePart of rawCookieHeader.split(";")) {
            const [name, ...valueParts] = cookiePart.trim().split("=");

            if (!name) continue;

            cookies[name] = decodeURIComponent(valueParts.join("="));
        }
    }

    req.cookies = cookies;
    next();
}
