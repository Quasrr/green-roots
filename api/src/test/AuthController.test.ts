import * as assert from "node:assert/strict";
import { describe, it } from "node:test";
import argon2 from "argon2";
import { prisma } from "../models/index.ts";
import { baseUrl, createTestSession, loginAndGetSession } from "./helpers/http.ts";

const testUser = {
    id: 1,
    firstname: "Green",
    lastname: "Roots",
    email: "test.user@greenroots.fr",
    password: "GreenRoots123!",
};

async function createUser(email = testUser.email, password = testUser.password) {
    return prisma.user.create({
        data: {
            lastname: testUser.lastname,
            firstname: testUser.firstname,
            email,
            password: await argon2.hash(password),
            roleId: 2,
        },
    });
}

describe("POST /api/auth/register", () => {
    it("creates a user and returns a sanitized payload", async () => {
        const session = await createTestSession();
        const response = await session.csrfFetch(`${baseUrl}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                lastname: testUser.lastname,
                firstname: testUser.firstname,
                email: testUser.email,
                password: testUser.password,
            }),
        });

        assert.equal(response.status, 201);
        assert.deepEqual(await response.json(), {
            message: "OK",
            user: {
                id: 1,
                email: testUser.email,
                firstname: testUser.firstname,
                lastname: testUser.lastname,
            },
        });
    });

    it("returns 422 when password format is invalid", async () => {
        const session = await createTestSession();
        const response = await session.csrfFetch(`${baseUrl}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                lastname: testUser.lastname,
                firstname: testUser.firstname,
                email: testUser.email,
                password: "greenroots123",
            }),
        });

        assert.equal(response.status, 422);
        assert.match(await response.text(), /Invalid password format/);
    });

    it("returns 409 when email is already used", async () => {
        await createUser();

        const session = await createTestSession();
        const response = await session.csrfFetch(`${baseUrl}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                lastname: testUser.lastname,
                firstname: testUser.firstname,
                email: testUser.email,
                password: testUser.password,
            }),
        });

        assert.equal(response.status, 409);
        assert.match(await response.text(), /Email already in use/);
    });

    it("returns 422 when payload is invalid", async () => {
        const session = await createTestSession();
        const response = await session.csrfFetch(`${baseUrl}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                lastname: "D",
                firstname: "J",
                email: "not-an-email",
                password: "123",
            }),
        });

        assert.equal(response.status, 422);
    });
});

describe("POST /api/auth/login", () => {
    it("returns the email and sets the auth cookie on success", async () => {
        await createUser();

        const session = await createTestSession();
        const response = await session.csrfFetch(`${baseUrl}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: testUser.email,
                password: testUser.password,
            }),
        });

        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), { email: testUser.email });
        assert.match(response.headers.get("set-cookie") ?? "", /access_token=/);
    });

    it("returns 404 when the user does not exist", async () => {
        const session = await createTestSession();
        const response = await session.csrfFetch(`${baseUrl}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: testUser.email,
                password: testUser.password,
            }),
        });

        assert.equal(response.status, 404);
        assert.match(await response.text(), /Invalid credentials/);
    });

    it("returns 401 when the password is invalid", async () => {
        await createUser();

        const session = await createTestSession();
        const response = await session.csrfFetch(`${baseUrl}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: testUser.email,
                password: "wrongpass",
            }),
        });

        assert.equal(response.status, 401);
        assert.match(await response.text(), /Invalid credentials/);
    });

    it("returns 422 when payload is invalid", async () => {
        const session = await createTestSession();
        const response = await session.csrfFetch(`${baseUrl}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: "not-an-email",
                password: "123",
            }),
        });

        assert.equal(response.status, 422);
    });
});

describe("POST /api/auth/logout", () => {
    it("returns 204 and clears the auth cookie", async () => {
        await createUser();
        const { session } = await loginAndGetSession(testUser.email, testUser.password);

        const response = await session.csrfFetch(`${baseUrl}/api/auth/logout`, {
            method: "POST",
        });

        assert.equal(response.status, 204);
        assert.match(response.headers.get("set-cookie") ?? "", /access_token=/);
    });

    it("returns 401 when no auth cookie is provided", async () => {
        const session = await createTestSession();
        const response = await session.csrfFetch(`${baseUrl}/api/auth/logout`, {
            method: "POST",
        });

        assert.equal(response.status, 401);
        assert.match(await response.text(), /Unauthorized/);
    });
});

describe("GET /api/auth/me", () => {
    it("returns the connected user profile", async () => {
        await createUser();
        const { session } = await loginAndGetSession(testUser.email, testUser.password);

        const response = await session.fetch(`${baseUrl}/api/auth/me`);

        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), {
            id: testUser.id,
            email: testUser.email,
            firstname: testUser.firstname,
            lastname: testUser.lastname,
            role: 2,
        });
    });

    it("returns 401 when no auth cookie is provided", async () => {
        const response = await fetch(`${baseUrl}/api/auth/me`);

        assert.equal(response.status, 401);
        assert.match(await response.text(), /Unauthorized/);
    });
});
