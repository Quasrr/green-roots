import * as assert from "node:assert/strict";
import { describe, it } from "node:test";
import argon2 from "argon2";
import { prisma } from "../models/index.ts";
import { baseUrl, loginAndGetSession } from "./helpers/http.ts";

async function createUser({
    firstname = "Test",
    lastname = "User",
    email = "user@greenroots.fr",
    password = "GreenRoots123",
    address = "12 rue des arbres",
    roleId = 2,
}: {
    firstname?: string;
    lastname?: string;
    email?: string;
    password?: string;
    address?: string;
    roleId?: number;
}) {
    return prisma.user.create({
        data: {
            firstname,
            lastname,
            email,
            password: await argon2.hash(password),
            address,
            roleId,
        },
    });
}

describe("GET /api/users", () => {
    it("returns all users for an admin", async () => {
        await createUser({ email: "admin@greenroots.fr", roleId: 1 });
        await createUser({ email: "user@greenroots.fr", roleId: 2 });

        const { session } = await loginAndGetSession("admin@greenroots.fr", "GreenRoots123");
        const response = await session.fetch(`${baseUrl}/api/users`);

        assert.equal(response.status, 200);

        const users = await response.json();
        assert.equal(users.length, 2);
        assert.deepEqual(users[0].role, { nameRole: "admin" });
        assert.deepEqual(users[1].role, { nameRole: "user" });
    });

    it("returns 403 for a non-admin user", async () => {
        await createUser({ email: "user@greenroots.fr", roleId: 2 });

        const { session } = await loginAndGetSession("user@greenroots.fr", "GreenRoots123");
        const response = await session.fetch(`${baseUrl}/api/users`);

        assert.equal(response.status, 403);
        assert.match(await response.text(), /Forbidden/);
    });

    it("returns 401 without auth cookie", async () => {
        const response = await fetch(`${baseUrl}/api/users`);

        assert.equal(response.status, 401);
        assert.match(await response.text(), /Unauthorized/);
    });
});

describe("GET /api/users/:id", () => {
    it("returns a user by id for an authenticated user", async () => {
        const connectedUser = await createUser({ email: "viewer@greenroots.fr" });
        const targetUser = await createUser({ email: "target@greenroots.fr", firstname: "Target" });

        const { session } = await loginAndGetSession("viewer@greenroots.fr", "GreenRoots123");
        const response = await session.fetch(`${baseUrl}/api/users/${targetUser.id}`);

        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), {
            id: targetUser.id,
            address: "12 rue des arbres",
            email: "target@greenroots.fr",
            firstname: "Target",
            lastname: "User",
            role: { nameRole: "user" },
        });

        assert.ok(connectedUser.id > 0);
    });

    it("returns 404 when the user does not exist", async () => {
        await createUser({ email: "viewer@greenroots.fr" });
        const { session } = await loginAndGetSession("viewer@greenroots.fr", "GreenRoots123");

        const response = await session.fetch(`${baseUrl}/api/users/999`);

        assert.equal(response.status, 404);
        assert.match(await response.text(), /User not found/);
    });
});

describe("PATCH /api/users/:id", () => {
    it("updates a user with a partial payload", async () => {
        await createUser({ email: "viewer@greenroots.fr" });
        const user = await createUser({ email: "target@greenroots.fr" });
        const { session } = await loginAndGetSession("viewer@greenroots.fr", "GreenRoots123");

        const response = await session.csrfFetch(`${baseUrl}/api/users/${user.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                firstname: "Updated",
                address: "34 avenue des jardins",
            }),
        });

        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), {
            id: user.id,
            address: "34 avenue des jardins",
            email: "target@greenroots.fr",
            firstname: "Updated",
            lastname: "User",
            role: { nameRole: "user" },
        });
    });

    it("returns 404 when the user does not exist", async () => {
        await createUser({ email: "viewer@greenroots.fr" });
        const { session } = await loginAndGetSession("viewer@greenroots.fr", "GreenRoots123");

        const response = await session.csrfFetch(`${baseUrl}/api/users/999`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ firstname: "Updated" }),
        });

        assert.equal(response.status, 404);
        assert.match(await response.text(), /User not found/);
    });

    it("returns 422 when payload is invalid", async () => {
        await createUser({ email: "viewer@greenroots.fr" });
        const user = await createUser({ email: "target@greenroots.fr" });
        const { session } = await loginAndGetSession("viewer@greenroots.fr", "GreenRoots123");

        const response = await session.csrfFetch(`${baseUrl}/api/users/${user.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ firstname: "A" }),
        });

        assert.equal(response.status, 422);
    });
});

describe("DELETE /api/users/:id", () => {
    it("deletes the connected user", async () => {
        const user = await createUser({ email: "viewer@greenroots.fr" });
        const { session } = await loginAndGetSession("viewer@greenroots.fr", "GreenRoots123");

        const response = await session.csrfFetch(`${baseUrl}/api/users/${user.id}`, {
            method: "DELETE",
        });

        assert.equal(response.status, 204);

        const deletedUser = await prisma.user.findUnique({
            where: { id: user.id },
        });

        assert.equal(deletedUser, null);
    });

    it("returns 403 when a user tries to delete another account", async () => {
        await createUser({ email: "viewer@greenroots.fr" });
        const user = await createUser({ email: "target@greenroots.fr" });
        const { session } = await loginAndGetSession("viewer@greenroots.fr", "GreenRoots123");

        const response = await session.csrfFetch(`${baseUrl}/api/users/${user.id}`, {
            method: "DELETE",
        });

        assert.equal(response.status, 403);
        assert.match(await response.text(), /Forbidden/);
    });

    it("returns 404 when the user does not exist", async () => {
        const user = await createUser({ email: "viewer@greenroots.fr" });
        const { session } = await loginAndGetSession("viewer@greenroots.fr", "GreenRoots123");

        await prisma.user.delete({
            where: { id: user.id },
        });

        const response = await session.csrfFetch(`${baseUrl}/api/users/${user.id}`, {
            method: "DELETE",
        });

        assert.equal(response.status, 404);
        assert.match(await response.text(), /User not found/);
    });
});
