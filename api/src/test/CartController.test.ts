import * as assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import argon2 from "argon2";
import redis from "../models/redis.ts";
import { Growth, prisma } from "../models/index.ts";
import { baseUrl, createTestSession, loginAndGetSession } from "./helpers/http.ts";

const testUser = {
    firstname: "Cart",
    lastname: "Tester",
    email: "cart.user@greenroots.fr",
    password: "GreenRoots123",
};

function getCartKey(email: string) {
    return `cart:${email.toLowerCase()}`;
}

async function createUser(email = testUser.email, password = testUser.password) {
    return prisma.user.create({
        data: {
            firstname: testUser.firstname,
            lastname: testUser.lastname,
            email,
            password: await argon2.hash(password),
            roleId: 2,
        },
    });
}

async function createTree(quantity = 10) {
    return prisma.tree.create({
        data: {
            name: `Tree-${Date.now()}-${Math.random()}`,
            price: 49.9,
            description: "Arbre de test",
            impact_co2: 10,
            impact_o2: 8,
            image: `tree-${Date.now()}-${Math.random()}.webp`,
            quantity,
            label: "Label test",
            country: "France",
            height: 4,
            growth: Growth.medium,
            exposition: "Soleil",
            rusticity: "6-8",
        },
    });
}

beforeEach(async () => {
    await redis.del(getCartKey(testUser.email));
});

describe("GET /api/cart", () => {
    it("returns an empty cart for an authenticated user", async () => {
        await createUser();
        const { session } = await loginAndGetSession(testUser.email, testUser.password);

        const response = await session.fetch(`${baseUrl}/api/cart`);

        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), { items: [] });
    });

    it("returns 401 when no auth cookie is provided", async () => {
        const response = await fetch(`${baseUrl}/api/cart`);

        assert.equal(response.status, 401);
        assert.match(await response.text(), /Unauthorized/);
    });
});

describe("PUT /api/cart", () => {
    it("adds an item to the cart", async () => {
        await createUser();
        const { session } = await loginAndGetSession(testUser.email, testUser.password);
        const tree = await createTree(10);

        const response = await session.csrfFetch(`${baseUrl}/api/cart`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                item: {
                    id: tree.id,
                    quantity: 2,
                },
            }),
        });

        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), {
            items: [
                {
                    id: tree.id,
                    title: tree.name,
                    image: tree.image,
                    price: 49.9,
                    inStock: true,
                    label: tree.label,
                    quantity: 2,
                },
            ],
        });
    });

    it("increments quantity when the item already exists", async () => {
        await createUser();
        const { session } = await loginAndGetSession(testUser.email, testUser.password);
        const tree = await createTree(10);

        await session.csrfFetch(`${baseUrl}/api/cart`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                item: {
                    id: tree.id,
                    quantity: 1,
                },
            }),
        });

        const response = await session.csrfFetch(`${baseUrl}/api/cart`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                item: {
                    id: tree.id,
                    quantity: 3,
                },
            }),
        });

        assert.equal(response.status, 200);
        assert.equal((await response.json()).items[0].quantity, 4);
    });

    it("decrements quantity and removes item when resulting quantity is <= 0", async () => {
        await createUser();
        const { session } = await loginAndGetSession(testUser.email, testUser.password);
        const tree = await createTree(10);

        await session.csrfFetch(`${baseUrl}/api/cart`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                item: {
                    id: tree.id,
                    quantity: 2,
                },
            }),
        });

        const response = await session.csrfFetch(`${baseUrl}/api/cart`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                item: {
                    id: tree.id,
                    quantity: -2,
                },
            }),
        });

        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), { items: [] });
    });

    it("removes an item when quantity is set to 0", async () => {
        await createUser();
        const { session } = await loginAndGetSession(testUser.email, testUser.password);
        const tree = await createTree(10);

        await session.csrfFetch(`${baseUrl}/api/cart`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                item: {
                    id: tree.id,
                    quantity: 2,
                },
            }),
        });

        const response = await session.csrfFetch(`${baseUrl}/api/cart`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                item: {
                    id: tree.id,
                    quantity: 0,
                },
            }),
        });

        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), { items: [] });
    });

    it("returns 404 when decrementing an item that is not in the cart", async () => {
        await createUser();
        const { session } = await loginAndGetSession(testUser.email, testUser.password);
        const tree = await createTree(10);

        const response = await session.csrfFetch(`${baseUrl}/api/cart`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                item: {
                    id: tree.id,
                    quantity: -1,
                },
            }),
        });

        assert.equal(response.status, 404);
        assert.match(await response.text(), /Item not found in cart/);
    });

    it("returns 400 when trying to add an out-of-stock tree", async () => {
        await createUser();
        const { session } = await loginAndGetSession(testUser.email, testUser.password);
        const tree = await createTree(0);

        const response = await session.csrfFetch(`${baseUrl}/api/cart`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                item: {
                    id: tree.id,
                    quantity: 1,
                },
            }),
        });

        assert.equal(response.status, 400);
        assert.match(await response.text(), /Tree out of stock/);
    });

    it("returns 400 when the requested quantity exceeds available stock", async () => {
        await createUser();
        const { session } = await loginAndGetSession(testUser.email, testUser.password);
        const tree = await createTree(2);

        const response = await session.csrfFetch(`${baseUrl}/api/cart`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                item: {
                    id: tree.id,
                    quantity: 3,
                },
            }),
        });

        assert.equal(response.status, 400);
        assert.match(await response.text(), /Insufficient stock/);
    });

    it("returns 400 when incrementing the cart would exceed available stock", async () => {
        await createUser();
        const { session } = await loginAndGetSession(testUser.email, testUser.password);
        const tree = await createTree(3);

        await session.csrfFetch(`${baseUrl}/api/cart`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                item: {
                    id: tree.id,
                    quantity: 2,
                },
            }),
        });

        const response = await session.csrfFetch(`${baseUrl}/api/cart`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                item: {
                    id: tree.id,
                    quantity: 2,
                },
            }),
        });

        assert.equal(response.status, 400);
        assert.match(await response.text(), /Insufficient stock/);

        const cartResponse = await session.fetch(`${baseUrl}/api/cart`);
        assert.equal(cartResponse.status, 200);
        assert.equal((await cartResponse.json()).items[0].quantity, 2);
    });

    it("returns 404 when the tree does not exist", async () => {
        await createUser();
        const { session } = await loginAndGetSession(testUser.email, testUser.password);

        const response = await session.csrfFetch(`${baseUrl}/api/cart`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                item: {
                    id: 9999,
                    quantity: 1,
                },
            }),
        });

        assert.equal(response.status, 404);
        assert.match(await response.text(), /Tree not found/);
    });

    it("returns 400 when quantity is missing", async () => {
        await createUser();
        const { session } = await loginAndGetSession(testUser.email, testUser.password);
        const tree = await createTree(10);

        const response = await session.csrfFetch(`${baseUrl}/api/cart`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                item: {
                    id: tree.id,
                },
            }),
        });

        assert.equal(response.status, 400);
        assert.match(await response.text(), /Item must contain a valid quantity/);
    });

    it("returns 422 when payload is invalid", async () => {
        await createUser();
        const { session } = await loginAndGetSession(testUser.email, testUser.password);

        const response = await session.csrfFetch(`${baseUrl}/api/cart`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                item: {
                    id: 0,
                    quantity: 1,
                },
            }),
        });

        assert.equal(response.status, 422);
    });

    it("returns 401 when no auth cookie is provided", async () => {
        const session = await createTestSession();
        const response = await session.csrfFetch(`${baseUrl}/api/cart`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                item: {
                    id: 1,
                    quantity: 1,
                },
            }),
        });

        assert.equal(response.status, 401);
        assert.match(await response.text(), /Unauthorized/);
    });
});
