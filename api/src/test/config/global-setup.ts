import type { Server } from "node:http";
import { after, before, beforeEach, type TestContext } from "node:test";
import express, { type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import { doubleCsrf } from "csrf-csrf";
import cors from "cors";
import helmet from "helmet";
import router from "../../routes.ts";
import { prisma } from "../../models/index.ts";
import redis from "../../models/redis.ts";

let server: Server;

before(async () => {
    await waitForDatabase();

    const app = express();
    app.use(express.json());
    app.use(helmet());
    app.use(cookieParser());
    app.use(cors({
        origin: [
            "http://localhost:5173",
            "https://greenroots.duckdns.org",
        ],
        credentials: true,
    }));

    const { generateToken, doubleCsrfProtection } = doubleCsrf({
        getSecret: () => process.env.JWT_SECRET as string,
        cookieName: "csrfToken",
        cookieOptions: {
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        },
    });

    app.get("/api/csrf", (req: Request, res: Response) => {
        const csrfToken = generateToken(req, res);
        res.send({ csrfToken });
    });

    app.use(doubleCsrfProtection);
    app.use(router);

    server = await new Promise<Server>((resolve) => {
        const instance = app.listen(Number(process.env.PORT), () => resolve(instance));
    });
});

beforeEach(async (t) => {
    (t as TestContext).mock.method(console, "info", () => {});

    await truncateTables();

    await prisma.role.createMany({
        data: [
            { id: 1, nameRole: "admin" },
            { id: 2, nameRole: "user" },
        ],
    });
});

after(async () => {
    if (!server) {
        await redis.quit().catch(() => {});
        await prisma.$disconnect();
        return;
    }

    await new Promise<void>((resolve, reject) => {
        server.close((error) => {
            if (error) {
                reject(error);
                return;
            }

            resolve();
        });
    });

    await redis.quit().catch(() => {});
    await prisma.$disconnect();
});

async function truncateTables() {
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

async function waitForDatabase() {
    for (let attempt = 0; attempt < 30; attempt += 1) {
        try {
            await prisma.$queryRawUnsafe("SELECT 1");

            return;
        } catch {
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }

    throw new Error("La base de donnee de test n'est pas disponible");
}
