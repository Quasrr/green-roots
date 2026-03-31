import * as assert from "node:assert/strict";
import { describe, it } from "node:test";
import argon2 from "argon2";
import { Growth, OrderStatus, prisma } from "../models/index.ts";
import { baseUrl, createTestSession, loginAndGetSession } from "./helpers/http.ts";

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

async function createTree(quantity = 10) {
    return prisma.tree.create({
        data: {
            name: "Chene",
            price: 30.0,
            description: "Un grand chene",
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

describe("GET /api/orders", () => {
    it("returns all orders for an admin", async () => {
        await createUser({ email: "admin@greenroots.fr", roleId: 1 });
        const { session } = await loginAndGetSession("admin@greenroots.fr", "GreenRoots123");

        const response = await session.fetch(`${baseUrl}/api/orders`);

        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), []);
    });

    it("returns 401 when unauthenticated", async () => {
        const response = await fetch(`${baseUrl}/api/orders`);

        assert.equal(response.status, 401);
    });

    it("returns 403 for a non-admin user", async () => {
        await createUser({ email: "user@greenroots.fr", roleId: 2 });
        const { session } = await loginAndGetSession("user@greenroots.fr", "GreenRoots123");

        const response = await session.fetch(`${baseUrl}/api/orders`);

        assert.equal(response.status, 403);
    });
});

describe("POST /api/orders", () => {
    it("creates an order for an authenticated user", async () => {
        await createUser({ email: "user@greenroots.fr", roleId: 2 });
        const tree = await createTree(10);
        const { session } = await loginAndGetSession("user@greenroots.fr", "GreenRoots123");

        const response = await session.csrfFetch(`${baseUrl}/api/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify([{ treeId: tree.id, quantity: 2 }]),
        });

        assert.equal(response.status, 201);

        const order = await response.json();
        assert.equal(order.total, "60");
        assert.equal(order.lines.length, 1);
        assert.equal(order.lines[0].treeId, tree.id);
        assert.equal(order.lines[0].quantity, 2);
    });

    it("keeps tree stock unchanged after order creation while the order is waiting", async () => {
        await createUser({ email: "user@greenroots.fr", roleId: 2 });
        const tree = await createTree(10);
        const { session } = await loginAndGetSession("user@greenroots.fr", "GreenRoots123");

        const response = await session.csrfFetch(`${baseUrl}/api/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify([{ treeId: tree.id, quantity: 3 }]),
        });

        assert.equal(response.status, 201);

        const order = await response.json();
        assert.equal(order.status, OrderStatus.waiting);

        const updatedTree = await prisma.tree.findUnique({ where: { id: tree.id } });
        assert.equal(updatedTree?.quantity, 10);
    });

    it("returns 401 when unauthenticated", async () => {
        const tree = await createTree();
        const session = await createTestSession();

        const response = await session.csrfFetch(`${baseUrl}/api/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify([{ treeId: tree.id, quantity: 1 }]),
        });

        assert.equal(response.status, 401);
    });

    it("returns 422 when the body is invalid", async () => {
        await createUser({ email: "user@greenroots.fr", roleId: 2 });
        const { session } = await loginAndGetSession("user@greenroots.fr", "GreenRoots123");

        const response = await session.csrfFetch(`${baseUrl}/api/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify([]),
        });

        assert.equal(response.status, 422);
    });

    it("returns 404 when a tree does not exist", async () => {
        await createUser({ email: "user@greenroots.fr", roleId: 2 });
        const { session } = await loginAndGetSession("user@greenroots.fr", "GreenRoots123");

        const response = await session.csrfFetch(`${baseUrl}/api/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify([{ treeId: 9999, quantity: 1 }]),
        });

        assert.equal(response.status, 404);
        assert.match(await response.text(), /Tree 9999 not found/);
    });

    it("returns 400 when stock is insufficient", async () => {
        await createUser({ email: "user@greenroots.fr", roleId: 2 });
        const tree = await createTree(1);
        const { session } = await loginAndGetSession("user@greenroots.fr", "GreenRoots123");

        const response = await session.csrfFetch(`${baseUrl}/api/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify([{ treeId: tree.id, quantity: 5 }]),
        });

        assert.equal(response.status, 400);
        assert.match(await response.text(), /Stock insuffisant/);
    });
});

describe("POST /api/orders/:id/pay", () => {
    it("marks one concurrent order as canceled when only one payment can consume the remaining stock", async () => {
        await createUser({ email: "first-user@greenroots.fr", roleId: 2 });
        await createUser({ email: "second-user@greenroots.fr", roleId: 2 });
        const tree = await createTree(9);

        const { session: firstSession } = await loginAndGetSession("first-user@greenroots.fr", "GreenRoots123");
        const { session: secondSession } = await loginAndGetSession("second-user@greenroots.fr", "GreenRoots123");

        const firstOrderResponse = await firstSession.csrfFetch(`${baseUrl}/api/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify([{ treeId: tree.id, quantity: 9 }]),
        });
        const secondOrderResponse = await secondSession.csrfFetch(`${baseUrl}/api/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify([{ treeId: tree.id, quantity: 9 }]),
        });

        assert.equal(firstOrderResponse.status, 201);
        assert.equal(secondOrderResponse.status, 201);

        const firstOrder = await firstOrderResponse.json();
        const secondOrder = await secondOrderResponse.json();

        const [firstPaymentResponse, secondPaymentResponse] = await Promise.all([
            firstSession.csrfFetch(`${baseUrl}/api/orders/${firstOrder.id}/pay`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            }),
            secondSession.csrfFetch(`${baseUrl}/api/orders/${secondOrder.id}/pay`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            }),
        ]);

        const paymentStatuses = [firstPaymentResponse.status, secondPaymentResponse.status].sort();
        assert.deepEqual(paymentStatuses, [200, 400]);

        const refreshedOrders = await prisma.order.findMany({
            orderBy: { id: "asc" },
            select: { id: true, status: true },
        });

        assert.equal(
            refreshedOrders.filter(order => order.status === OrderStatus.paid).length,
            1
        );
        assert.equal(
            refreshedOrders.filter(order => order.status === OrderStatus.canceled).length,
            1
        );

        const updatedTree = await prisma.tree.findUnique({
            where: { id: tree.id },
            select: { quantity: true },
        });

        assert.equal(updatedTree?.quantity, 0);
    });
});

describe("GET /api/orders/me/:id", () => {
    it("returns the order when it belongs to the authenticated user", async () => {
        await createUser({ email: "user@greenroots.fr", roleId: 2 });
        const tree = await createTree(10);
        const { session } = await loginAndGetSession("user@greenroots.fr", "GreenRoots123");

        const created = await session.csrfFetch(`${baseUrl}/api/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify([{ treeId: tree.id, quantity: 2 }]),
        });
        const order = await created.json();

        const response = await session.fetch(`${baseUrl}/api/orders/me/${order.id}`);

        assert.equal(response.status, 200);
        const data = await response.json();
        assert.equal(data.id, order.id);
    });

    it("returns the order for an admin even if it belongs to another user", async () => {
        await createUser({ email: "user@greenroots.fr", roleId: 2 });
        const tree = await createTree(10);
        const { session: userSession } = await loginAndGetSession("user@greenroots.fr", "GreenRoots123");

        const created = await userSession.csrfFetch(`${baseUrl}/api/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify([{ treeId: tree.id, quantity: 1 }]),
        });
        const order = await created.json();

        await createUser({ email: "admin@greenroots.fr", roleId: 1 });
        const { session: adminSession } = await loginAndGetSession("admin@greenroots.fr", "GreenRoots123");

        const response = await adminSession.fetch(`${baseUrl}/api/orders/me/${order.id}`);

        assert.equal(response.status, 200);
        const data = await response.json();
        assert.equal(data.id, order.id);
    });

    it("returns 401 when unauthenticated", async () => {
        const response = await fetch(`${baseUrl}/api/orders/me/1`);

        assert.equal(response.status, 401);
    });

    it("returns 400 when the id is invalid", async () => {
        await createUser({ email: "user@greenroots.fr", roleId: 2 });
        const { session } = await loginAndGetSession("user@greenroots.fr", "GreenRoots123");

        const response = await session.fetch(`${baseUrl}/api/orders/me/abc`);

        assert.equal(response.status, 400);
    });

    it("returns 404 when the order does not exist", async () => {
        await createUser({ email: "user@greenroots.fr", roleId: 2 });
        const { session } = await loginAndGetSession("user@greenroots.fr", "GreenRoots123");

        const response = await session.fetch(`${baseUrl}/api/orders/me/9999`);

        assert.equal(response.status, 404);
    });

    it("returns 404 when the order belongs to another user", async () => {
        await createUser({ email: "other@greenroots.fr", roleId: 2 });
        const tree = await createTree(10);
        const { session: otherSession } = await loginAndGetSession("other@greenroots.fr", "GreenRoots123");

        const created = await otherSession.csrfFetch(`${baseUrl}/api/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify([{ treeId: tree.id, quantity: 1 }]),
        });
        const order = await created.json();

        await createUser({ email: "user@greenroots.fr", roleId: 2 });
        const { session: userSession } = await loginAndGetSession("user@greenroots.fr", "GreenRoots123");

        const response = await userSession.fetch(`${baseUrl}/api/orders/me/${order.id}`);

        assert.equal(response.status, 404);
    });
});

describe("GET /api/orders/me", () => {
    it("returns an empty array when the user has no orders", async () => {
        await createUser({ email: "user@greenroots.fr", roleId: 2 });
        const { session } = await loginAndGetSession("user@greenroots.fr", "GreenRoots123");

        const response = await session.fetch(`${baseUrl}/api/orders/me`);

        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), []);
    });

    it("returns only the authenticated user's orders", async () => {
        const user = await createUser({ email: "user@greenroots.fr", roleId: 2 });
        await createUser({ email: "other@greenroots.fr", roleId: 2 });
        const tree = await createTree(10);

        const { session: userSession } = await loginAndGetSession("user@greenroots.fr", "GreenRoots123");
        const { session: otherSession } = await loginAndGetSession("other@greenroots.fr", "GreenRoots123");

        await otherSession.csrfFetch(`${baseUrl}/api/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify([{ treeId: tree.id, quantity: 1 }]),
        });

        await userSession.csrfFetch(`${baseUrl}/api/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify([{ treeId: tree.id, quantity: 2 }]),
        });

        const response = await userSession.fetch(`${baseUrl}/api/orders/me`);

        assert.equal(response.status, 200);
        const orders = await response.json();
        assert.equal(orders.length, 1);
        assert.equal(orders[0].userId, user.id);
        assert.equal(orders[0].lines[0].quantity, 2);
    });

    it("returns 401 when unauthenticated", async () => {
        const response = await fetch(`${baseUrl}/api/orders/me`);

        assert.equal(response.status, 401);
    });
});
