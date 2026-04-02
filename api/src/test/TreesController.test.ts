import * as assert from "node:assert/strict";
import { describe, it } from "node:test";
import argon2 from "argon2";
import { Growth, prisma } from "../models/index.ts";
import { baseUrl, createTestSession, loginAndGetSession } from "./helpers/http.ts";

function sortCategories<T extends { categories: Array<{ id: number; name: string }> }>(tree: T) {
    return {
        ...tree,
        categories: [...tree.categories].sort((a, b) => a.id - b.id),
    };
}

async function createUser({
    firstname = "Admin",
    lastname = "User",
    email = "admin@greenroots.fr",
    password = "GreenRoots123",
    roleId = 1,
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

async function createCategory(name: string) {
    return prisma.category.create({
        data: { name },
    });
}

async function createTreeWithCategories(categoryIds: number[]) {
    return prisma.tree.create({
        data: {
            name: "Olivier",
            price: 49.9,
            description: "Arbre mediterraneen",
            impact_co2: 18,
            impact_o2: 14,
            image: "olivier.webp",
            quantity: 10,
            label: "Esprit mediterraneen persistant",
            country: "Italie",
            height: 6,
            growth: Growth.slow,
            exposition: "Soleil",
            rusticity: "8-10",
            categories: {
                create: categoryIds.map((categoryId) => ({
                    category: {
                        connect: { id: categoryId },
                    },
                })),
            },
        },
    });
}

describe("GET /api/trees", () => {
    it("returns trees with normalized categories", async () => {
        const fruitier = await createCategory("Fruitier");
        const persistant = await createCategory("Persistant");
        await createTreeWithCategories([fruitier.id, persistant.id]);

        const response = await fetch(`${baseUrl}/api/trees`);

        assert.equal(response.status, 200);
        const trees = await response.json();

        assert.deepEqual(trees.map(sortCategories), [
            {
                id: 1,
                name: "Olivier",
                price: "49.9",
                description: "Arbre mediterraneen",
                impact_co2: "18",
                impact_o2: "14",
                image: "olivier.webp",
                quantity: 10,
                label: "Esprit mediterraneen persistant",
                country: "Italie",
                height: "6",
                growth: "slow",
                exposition: "Soleil",
                rusticity: "8-10",
                categories: [
                    { id: fruitier.id, name: "Fruitier" },
                    { id: persistant.id, name: "Persistant" },
                ],
            },
        ]);
    });
});

describe("GET /api/trees/:id", () => {
    it("returns one tree by id", async () => {
        const fruitier = await createCategory("Fruitier");
        const tree = await createTreeWithCategories([fruitier.id]);

        const response = await fetch(`${baseUrl}/api/trees/${tree.id}`);

        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), {
            id: tree.id,
            name: "Olivier",
            price: "49.9",
            description: "Arbre mediterraneen",
            impact_co2: "18",
            impact_o2: "14",
            image: "olivier.webp",
            quantity: 10,
            label: "Esprit mediterraneen persistant",
            country: "Italie",
            height: "6",
            growth: "slow",
            exposition: "Soleil",
            rusticity: "8-10",
            categories: [{ id: fruitier.id, name: "Fruitier" }],
        });
    });

    it("returns 404 when the tree does not exist", async () => {
        const response = await fetch(`${baseUrl}/api/trees/999`);

        assert.equal(response.status, 404);
        assert.match(await response.text(), /Tree not found/);
    });

    it("returns 404 when the tree id is invalid", async () => {
        const response = await fetch(`${baseUrl}/api/trees/0`);

        assert.equal(response.status, 404);
        assert.match(await response.text(), /Tree not found/);
    });
});

describe("POST /api/trees", () => {
    it("creates a tree for an admin", async () => {
        await createUser({ email: "admin@greenroots.fr", roleId: 1 });
        const fruitier = await createCategory("Fruitier");
        const persistant = await createCategory("Persistant");
        const { session } = await loginAndGetSession("admin@greenroots.fr", "GreenRoots123");

        const response = await session.csrfFetch(`${baseUrl}/api/trees`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Olivier",
                price: 49.9,
                description: "Arbre mediterraneen",
                impact_co2: 18,
                impact_o2: 14,
                image: "olivier.webp",
                quantity: 10,
                label: "Esprit mediterraneen persistant",
                country: "Italie",
                height: 6,
                growth: "slow",
                exposition: "Soleil",
                rusticity: "8-10",
                categories: [fruitier.id, persistant.id],
            }),
        });

        assert.equal(response.status, 201);
        assert.deepEqual(sortCategories(await response.json()), {
            id: 1,
            name: "Olivier",
            price: "49.9",
            description: "Arbre mediterraneen",
            impact_co2: "18",
            impact_o2: "14",
            image: "olivier.webp",
            quantity: 10,
            label: "Esprit mediterraneen persistant",
            country: "Italie",
            height: "6",
            growth: "slow",
            exposition: "Soleil",
            rusticity: "8-10",
            categories: [
                { id: fruitier.id, name: "Fruitier" },
                { id: persistant.id, name: "Persistant" },
            ],
        });
    });

    it("returns 401 without auth cookie", async () => {
        const session = await createTestSession();
        const response = await session.csrfFetch(`${baseUrl}/api/trees`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Olivier",
                price: 49.9,
                description: "Arbre mediterraneen",
                impact_co2: 18,
                impact_o2: 14,
                image: "olivier.webp",
                quantity: 10,
                label: "Esprit mediterraneen persistant",
                country: "Italie",
                height: 6,
                growth: "slow",
                exposition: "Soleil",
                rusticity: "8-10",
                categories: [],
            }),
        });

        assert.equal(response.status, 401);
        assert.match(await response.text(), /Unauthorized/);
    });

    it("returns 403 for a non-admin user", async () => {
        await createUser({ email: "user@greenroots.fr", roleId: 2 });
        await createCategory("Fruitier");
        const { session } = await loginAndGetSession("user@greenroots.fr", "GreenRoots123");

        const response = await session.csrfFetch(`${baseUrl}/api/trees`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Olivier",
                price: 49.9,
                description: "Arbre mediterraneen",
                impact_co2: 18,
                impact_o2: 14,
                image: "olivier.webp",
                quantity: 10,
                label: "Esprit mediterraneen persistant",
                country: "Italie",
                height: 6,
                growth: "slow",
                exposition: "Soleil",
                rusticity: "8-10",
                categories: [1],
            }),
        });

        assert.equal(response.status, 403);
        assert.match(await response.text(), /Forbidden/);
    });

    it("returns 409 when the tree already exists", async () => {
        await createUser({ email: "admin@greenroots.fr", roleId: 1 });
        const fruitier = await createCategory("Fruitier");
        await createTreeWithCategories([fruitier.id]);
        const { session } = await loginAndGetSession("admin@greenroots.fr", "GreenRoots123");

        const response = await session.csrfFetch(`${baseUrl}/api/trees`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Olivier",
                price: 49.9,
                description: "Autre arbre",
                impact_co2: 18,
                impact_o2: 14,
                image: "different-image.webp",
                quantity: 10,
                label: "Esprit mediterraneen persistant",
                country: "Italie",
                height: 6,
                growth: "slow",
                exposition: "Soleil",
                rusticity: "8-10",
                categories: [fruitier.id],
            }),
        });

        assert.equal(response.status, 409);
        assert.match(await response.text(), /Tree already exists/);
    });

    it("returns 422 when payload is invalid", async () => {
        await createUser({ email: "admin@greenroots.fr", roleId: 1 });
        const { session } = await loginAndGetSession("admin@greenroots.fr", "GreenRoots123");

        const response = await session.csrfFetch(`${baseUrl}/api/trees`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "",
                price: -1,
            }),
        });

        assert.equal(response.status, 422);
    });
});

describe("PATCH /api/trees/:id", () => {
    it("updates scalar fields for an admin", async () => {
        await createUser({ email: "admin@greenroots.fr", roleId: 1 });
        const fruitier = await createCategory("Fruitier");
        const tree = await createTreeWithCategories([fruitier.id]);
        const { session } = await loginAndGetSession("admin@greenroots.fr", "GreenRoots123");

        const response = await session.csrfFetch(`${baseUrl}/api/trees/${tree.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Olivier",
                price: 600,
                description: "Arbre mediterraneen",
                impact_co2: 18,
                impact_o2: 14,
                image: "olivier.webp",
                quantity: 10,
                label: "Esprit mediterraneen persistant",
                country: "Italie",
                height: 6,
                growth: "slow",
                exposition: "Soleil",
                rusticity: "8-10",
                categories: [fruitier.id],
            }),
        });

        assert.equal(response.status, 200);
        assert.equal((await response.json()).price, "600");
    });

    it("returns 401 without auth cookie", async () => {
        const fruitier = await createCategory("Fruitier");
        const tree = await createTreeWithCategories([fruitier.id]);
        const session = await createTestSession();

        const response = await session.csrfFetch(`${baseUrl}/api/trees/${tree.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Olivier",
                price: 49.9,
                description: "Arbre mediterraneen",
                impact_co2: 18,
                impact_o2: 14,
                image: "olivier.webp",
                quantity: 10,
                label: "Esprit mediterraneen persistant",
                country: "Italie",
                height: 6,
                growth: "slow",
                exposition: "Soleil",
                rusticity: "8-10",
                categories: [fruitier.id],
            }),
        });

        assert.equal(response.status, 401);
        assert.match(await response.text(), /Unauthorized/);
    });

    it("returns 403 for a non-admin user", async () => {
        await createUser({ email: "user@greenroots.fr", roleId: 2 });
        const fruitier = await createCategory("Fruitier");
        const tree = await createTreeWithCategories([fruitier.id]);
        const { session } = await loginAndGetSession("user@greenroots.fr", "GreenRoots123");

        const response = await session.csrfFetch(`${baseUrl}/api/trees/${tree.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Olivier",
                price: 49.9,
                description: "Arbre mediterraneen",
                impact_co2: 18,
                impact_o2: 14,
                image: "olivier.webp",
                quantity: 10,
                label: "Esprit mediterraneen persistant",
                country: "Italie",
                height: 6,
                growth: "slow",
                exposition: "Soleil",
                rusticity: "8-10",
                categories: [fruitier.id],
            }),
        });

        assert.equal(response.status, 403);
        assert.match(await response.text(), /Forbidden/);
    });

    it("replaces categories when categories are provided", async () => {
        await createUser({ email: "admin@greenroots.fr", roleId: 1 });
        const fruitier = await createCategory("Fruitier");
        const persistant = await createCategory("Persistant");
        const tree = await createTreeWithCategories([fruitier.id]);
        const { session } = await loginAndGetSession("admin@greenroots.fr", "GreenRoots123");

        const response = await session.csrfFetch(`${baseUrl}/api/trees/${tree.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Olivier",
                price: 49.9,
                description: "Arbre mediterraneen",
                impact_co2: 18,
                impact_o2: 14,
                image: "olivier.webp",
                quantity: 10,
                label: "Esprit mediterraneen persistant",
                country: "Italie",
                height: 6,
                growth: "slow",
                exposition: "Soleil",
                rusticity: "8-10",
                categories: [persistant.id],
            }),
        });

        assert.equal(response.status, 200);
        assert.deepEqual((await response.json()).categories, [
            { id: persistant.id, name: "Persistant" },
        ]);
    });

    it("returns 409 when another tree already uses the same name", async () => {
        await createUser({ email: "admin@greenroots.fr", roleId: 1 });
        const fruitier = await createCategory("Fruitier");
        const persistant = await createCategory("Persistant");
        await createTreeWithCategories([fruitier.id]);
        const tree = await prisma.tree.create({
            data: {
                name: "Citronnier",
                price: 39.9,
                description: "Arbre citrus",
                impact_co2: 12,
                impact_o2: 10,
                image: "citronnier.webp",
                quantity: 5,
                label: "Parfum citronne",
                country: "Espagne",
                height: 3,
                growth: Growth.medium,
                exposition: "Soleil",
                rusticity: "7-9",
                categories: {
                    create: [{
                        category: {
                            connect: { id: persistant.id },
                        },
                    }],
                },
            },
        });
        const { session } = await loginAndGetSession("admin@greenroots.fr", "GreenRoots123");

        const response = await session.csrfFetch(`${baseUrl}/api/trees/${tree.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Olivier",
                price: 39.9,
                description: "Arbre citrus",
                impact_co2: 12,
                impact_o2: 10,
                image: "citronnier.webp",
                quantity: 5,
                label: "Parfum citronne",
                country: "Espagne",
                height: 3,
                growth: "medium",
                exposition: "Soleil",
                rusticity: "7-9",
                categories: [persistant.id],
            }),
        });

        assert.equal(response.status, 409);
        assert.match(await response.text(), /Tree already exists/);
    });

    it("returns 404 when the tree does not exist", async () => {
        await createUser({ email: "admin@greenroots.fr", roleId: 1 });
        const { session } = await loginAndGetSession("admin@greenroots.fr", "GreenRoots123");

        const response = await session.csrfFetch(`${baseUrl}/api/trees/999`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Olivier",
                price: 600,
                description: "Arbre mediterraneen",
                impact_co2: 18,
                impact_o2: 14,
                image: "olivier.webp",
                quantity: 10,
                label: "Esprit mediterraneen persistant",
                country: "Italie",
                height: 6,
                growth: "slow",
                exposition: "Soleil",
                rusticity: "8-10",
                categories: [],
            }),
        });

        assert.equal(response.status, 404);
    });

    it("returns 422 when payload is invalid", async () => {
        await createUser({ email: "admin@greenroots.fr", roleId: 1 });
        const fruitier = await createCategory("Fruitier");
        const tree = await createTreeWithCategories([fruitier.id]);
        const { session } = await loginAndGetSession("admin@greenroots.fr", "GreenRoots123");

        const response = await session.csrfFetch(`${baseUrl}/api/trees/${tree.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "",
                price: -1,
            }),
        });

        assert.equal(response.status, 422);
    });
});

describe("DELETE /api/trees/:id", () => {
    it("deletes a tree for an admin", async () => {
        await createUser({ email: "admin@greenroots.fr", roleId: 1 });
        const fruitier = await createCategory("Fruitier");
        const tree = await createTreeWithCategories([fruitier.id]);
        const { session } = await loginAndGetSession("admin@greenroots.fr", "GreenRoots123");

        const response = await session.csrfFetch(`${baseUrl}/api/trees/${tree.id}`, {
            method: "DELETE",
        });

        assert.equal(response.status, 204);

        const deletedTree = await prisma.tree.findUnique({
            where: { id: tree.id },
        });

        assert.equal(deletedTree, null);
    });

    it("returns 401 without auth cookie", async () => {
        const fruitier = await createCategory("Fruitier");
        const tree = await createTreeWithCategories([fruitier.id]);
        const session = await createTestSession();

        const response = await session.csrfFetch(`${baseUrl}/api/trees/${tree.id}`, {
            method: "DELETE",
        });

        assert.equal(response.status, 401);
        assert.match(await response.text(), /Unauthorized/);
    });

    it("returns 403 for a non-admin user", async () => {
        await createUser({ email: "user@greenroots.fr", roleId: 2 });
        const fruitier = await createCategory("Fruitier");
        const tree = await createTreeWithCategories([fruitier.id]);
        const { session } = await loginAndGetSession("user@greenroots.fr", "GreenRoots123");

        const response = await session.csrfFetch(`${baseUrl}/api/trees/${tree.id}`, {
            method: "DELETE",
        });

        assert.equal(response.status, 403);
        assert.match(await response.text(), /Forbidden/);
    });

    it("returns 404 when the tree does not exist", async () => {
        await createUser({ email: "admin@greenroots.fr", roleId: 1 });
        const { session } = await loginAndGetSession("admin@greenroots.fr", "GreenRoots123");

        const response = await session.csrfFetch(`${baseUrl}/api/trees/999`, {
            method: "DELETE",
        });

        assert.equal(response.status, 404);
    });
});
