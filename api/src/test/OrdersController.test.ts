import * as assert from "node:assert/strict";
import { describe, it } from "node:test";
import argon2 from "argon2";
import { Growth, prisma } from "../models/index.ts";

const baseUrl = `http://localhost:${process.env.PORT}`;



async function createUser({
    firstname = "Test",
    lastname = "User",
    email = "user@greenroots.fr",
    password = "GreenRoots123",
    roleId = 2,
}: {
    firstname?: string;
    lastname?: string;
    email?: string;
    password?: string;
    roleId?: number;
}) {
    return prisma.user.create({
        data: {
            firstname,
            lastname,
            email,
            password: await argon2.hash(password),
            roleId,
        },
    });
}

async function loginAndGetCookie(email: string, password: string) {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    return response.headers.get("set-cookie") ?? "";
}

async function createTree(quantity = 10) {
    return prisma.tree.create({
        data: {
            name: "Chêne",
            price: 30.0,
            description: "Un grand chêne",
            impact_co2: 20,
            impact_o2: 15,
            image: "chene.webp",
            quantity,
            label: "Robuste et majestueux",
            country: "France",
            height: 20,
            growth: Growth.slow,
            exposition: "Soleil",
            rusticity: "4-8",
        },
    });
}

// --- Tests ---

describe("GET /api/orders", () => {
    it("retourne toutes les commandes pour un admin", async () => {
        // On crée un admin et on se connecte
        await createUser({ email: "admin@greenroots.fr", roleId: 1 });
        const cookie = await loginAndGetCookie("admin@greenroots.fr", "GreenRoots123");

        const response = await fetch(`${baseUrl}/api/orders`, {
            headers: { Cookie: cookie },
        });

        assert.equal(response.status, 200);
        const orders = await response.json();
        // La base est vide donc on attend un tableau vide
        assert.deepEqual(orders, []);
    });

    it("retourne 401 si non connecté", async () => {
        const response = await fetch(`${baseUrl}/api/orders`);

        assert.equal(response.status, 401);
    });

    it("retourne 403 pour un utilisateur non-admin", async () => {
        await createUser({ email: "user@greenroots.fr", roleId: 2 });
        const cookie = await loginAndGetCookie("user@greenroots.fr", "GreenRoots123");

        const response = await fetch(`${baseUrl}/api/orders`, {
            headers: { Cookie: cookie },
        });

        assert.equal(response.status, 403);
    });
});

describe("POST /api/orders", () => {
    it("crée une commande pour un utilisateur connecté", async () => {
        // On crée un utilisateur, un arbre, et on passe une commande
        await createUser({ email: "user@greenroots.fr", roleId: 2 });
        const tree = await createTree(10);
        const cookie = await loginAndGetCookie("user@greenroots.fr", "GreenRoots123");

        const response = await fetch(`${baseUrl}/api/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: cookie,
            },
            body: JSON.stringify([
                { treeId: tree.id, quantity: 2 },
            ]),
        });

        assert.equal(response.status, 201);

        const order = await response.json();
        // total = 30.00 * 2 = 60
        assert.equal(order.total, "60");
        assert.equal(order.lines.length, 1);
        assert.equal(order.lines[0].treeId, tree.id);
        assert.equal(order.lines[0].quantity, 2);
    });

    it("décrémente le stock de l'arbre après la commande", async () => {
        await createUser({ email: "user@greenroots.fr", roleId: 2 });
        const tree = await createTree(10);
        const cookie = await loginAndGetCookie("user@greenroots.fr", "GreenRoots123");

        await fetch(`${baseUrl}/api/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: cookie,
            },
            body: JSON.stringify([
                { treeId: tree.id, quantity: 3 },
            ]),
        });

        // On vérifie directement en base que le stock a bien baissé
        const updatedTree = await prisma.tree.findUnique({ where: { id: tree.id } });
        assert.equal(updatedTree?.quantity, 7); // 10 - 3 = 7
    });

    it("retourne 401 si non connecté", async () => {
        const tree = await createTree();

        const response = await fetch(`${baseUrl}/api/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify([{ treeId: tree.id, quantity: 1 }]),
        });

        assert.equal(response.status, 401);
    });

    it("retourne 422 si le body est invalide", async () => {
        await createUser({ email: "user@greenroots.fr", roleId: 2 });
        const cookie = await loginAndGetCookie("user@greenroots.fr", "GreenRoots123");

        // On envoie un tableau vide — le schema Zod exige min(1)
        const response = await fetch(`${baseUrl}/api/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: cookie,
            },
            body: JSON.stringify([]),
        });

        assert.equal(response.status, 422);
    });

    it("retourne 404 si un arbre n'existe pas", async () => {
        await createUser({ email: "user@greenroots.fr", roleId: 2 });
        const cookie = await loginAndGetCookie("user@greenroots.fr", "GreenRoots123");

        const response = await fetch(`${baseUrl}/api/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: cookie,
            },
            body: JSON.stringify([{ treeId: 9999, quantity: 1 }]),
        });

        assert.equal(response.status, 404);
        assert.match(await response.text(), /Tree 9999 not found/);
    });

    it("retourne une erreur si le stock est insuffisant", async () => {
        await createUser({ email: "user@greenroots.fr", roleId: 2 });
        // On crée un arbre avec seulement 1 en stock
        const tree = await createTree(1);
        const cookie = await loginAndGetCookie("user@greenroots.fr", "GreenRoots123");

        const response = await fetch(`${baseUrl}/api/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: cookie,
            },
            body: JSON.stringify([{ treeId: tree.id, quantity: 5 }]),
        });

        // Le stock est insuffisant, on attend une erreur
        assert.notEqual(response.status, 201);
    });
});

describe("GET /api/orders/me/:id", () => {
    it("retourne la commande si elle appartient à l'utilisateur connecté", async () => {
        await createUser({ email: "user@greenroots.fr", roleId: 2 });
        const tree = await createTree(10);
        const cookie = await loginAndGetCookie("user@greenroots.fr", "GreenRoots123");

        // On crée une commande
        const created = await fetch(`${baseUrl}/api/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Cookie: cookie },
            body: JSON.stringify([{ treeId: tree.id, quantity: 2 }]),
        });
        const order = await created.json();

        const response = await fetch(`${baseUrl}/api/orders/me/${order.id}`, {
            headers: { Cookie: cookie },
        });

        assert.equal(response.status, 200);
        const data = await response.json();
        assert.equal(data.id, order.id);
    });

    it("retourne la commande pour un admin même si elle ne lui appartient pas", async () => {
        // Un user crée une commande
        await createUser({ email: "user@greenroots.fr", roleId: 2 });
        const tree = await createTree(10);
        const cookieUser = await loginAndGetCookie("user@greenroots.fr", "GreenRoots123");

        const created = await fetch(`${baseUrl}/api/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Cookie: cookieUser },
            body: JSON.stringify([{ treeId: tree.id, quantity: 1 }]),
        });
        const order = await created.json();

        // L'admin essaie de la lire
        await createUser({ email: "admin@greenroots.fr", roleId: 1 });
        const cookieAdmin = await loginAndGetCookie("admin@greenroots.fr", "GreenRoots123");

        const response = await fetch(`${baseUrl}/api/orders/me/${order.id}`, {
            headers: { Cookie: cookieAdmin },
        });

        assert.equal(response.status, 200);
        const data = await response.json();
        assert.equal(data.id, order.id);
    });

    it("retourne 401 si non connecté", async () => {
        const response = await fetch(`${baseUrl}/api/orders/me/1`);

        assert.equal(response.status, 401);
    });

    it("retourne 400 si l'id est invalide (texte)", async () => {
        await createUser({ email: "user@greenroots.fr", roleId: 2 });
        const cookie = await loginAndGetCookie("user@greenroots.fr", "GreenRoots123");

        const response = await fetch(`${baseUrl}/api/orders/me/abc`, {
            headers: { Cookie: cookie },
        });

        assert.equal(response.status, 400);
    });

    it("retourne 404 si la commande n'existe pas", async () => {
        await createUser({ email: "user@greenroots.fr", roleId: 2 });
        const cookie = await loginAndGetCookie("user@greenroots.fr", "GreenRoots123");

        const response = await fetch(`${baseUrl}/api/orders/me/9999`, {
            headers: { Cookie: cookie },
        });

        assert.equal(response.status, 404);
    });

    it("retourne 404 si la commande appartient à un autre utilisateur (pas de fuite d'info)", async () => {
        // "other" crée une commande
        await createUser({ email: "other@greenroots.fr", roleId: 2 });
        const tree = await createTree(10);
        const cookieOther = await loginAndGetCookie("other@greenroots.fr", "GreenRoots123");

        const created = await fetch(`${baseUrl}/api/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Cookie: cookieOther },
            body: JSON.stringify([{ treeId: tree.id, quantity: 1 }]),
        });
        const order = await created.json();

        // "user" essaie de lire la commande d'un autre → doit recevoir 404 (pas 403)
        await createUser({ email: "user@greenroots.fr", roleId: 2 });
        const cookieUser = await loginAndGetCookie("user@greenroots.fr", "GreenRoots123");

        const response = await fetch(`${baseUrl}/api/orders/me/${order.id}`, {
            headers: { Cookie: cookieUser },
        });

        assert.equal(response.status, 404);
    });
});

describe("GET /api/orders/me", () => {
    it("retourne un tableau vide si l'utilisateur n'a pas de commandes", async () => {
        await createUser({ email: "user@greenroots.fr", roleId: 2 });
        const cookie = await loginAndGetCookie("user@greenroots.fr", "GreenRoots123");

        const response = await fetch(`${baseUrl}/api/orders/me`, {
            headers: { Cookie: cookie },
        });

        assert.equal(response.status, 200);
        const orders = await response.json();
        assert.deepEqual(orders, []);
    });

    it("retourne uniquement les commandes de l'utilisateur connecté", async () => {
        // On crée deux utilisateurs
        const user = await createUser({ email: "user@greenroots.fr", roleId: 2 });
        await createUser({ email: "other@greenroots.fr", roleId: 2 });
        const tree = await createTree(10);

        const cookieUser = await loginAndGetCookie("user@greenroots.fr", "GreenRoots123");
        const cookieOther = await loginAndGetCookie("other@greenroots.fr", "GreenRoots123");

        // L'utilisateur "other" passe une commande
        await fetch(`${baseUrl}/api/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Cookie: cookieOther },
            body: JSON.stringify([{ treeId: tree.id, quantity: 1 }]),
        });

        // L'utilisateur "user" passe une commande
        await fetch(`${baseUrl}/api/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Cookie: cookieUser },
            body: JSON.stringify([{ treeId: tree.id, quantity: 2 }]),
        });

        // On récupère les commandes de "user"
        const response = await fetch(`${baseUrl}/api/orders/me`, {
            headers: { Cookie: cookieUser },
        });

        assert.equal(response.status, 200);
        const orders = await response.json();

        // On doit avoir 1 seule commande, celle de "user"
        assert.equal(orders.length, 1);
        assert.equal(orders[0].userId, user.id);
        assert.equal(orders[0].lines[0].quantity, 2);
    });

    it("retourne 401 si non connecté", async () => {
        const response = await fetch(`${baseUrl}/api/orders/me`);

        assert.equal(response.status, 401);
    });
});
