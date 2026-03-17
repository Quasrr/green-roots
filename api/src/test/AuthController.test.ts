import * as assert from "node:assert/strict";
import { describe, it } from "node:test";
import argon2 from "argon2";
import { prisma } from "../models/index.ts";

const baseUrl = `http://localhost:${process.env.PORT}`;
const testUser = {
    firstname: "Green",
    lastname: "Roots",
    email: "test.user@greenroots.fr",
    password: "GreenRoots123"
};

async function createUser(email = testUser.email, password = testUser.password) {
    return prisma.user.create({
        data: {
            lastname: testUser.lastname,
            firstname: testUser.firstname,
            email,
            password: await argon2.hash(password),
            roleId: 2
        }
    });
};

async function loginAndGetCookie(email = testUser.email, password = testUser.password) {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    return {
        response,
        cookie: response.headers.get("set-cookie") ?? ""
    };
};

describe("POST /api/auth/register", () => {
    it("creates a user and returns a sanitized payload", async () => {
        const response = await fetch(`${baseUrl}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                lastname: testUser.lastname,
                firstname: testUser.firstname,
                email: testUser.email,
                password: testUser.password,
                passwordConfirm: testUser.password
            })
        });

        assert.equal(response.status, 201);
        assert.deepEqual(await response.json(), {
            message: "OK",
            user: {
                id: 1,
                email: testUser.email,
                firstname: testUser.firstname,
                lastname: testUser.lastname,
            }
        });
    });

    it("returns 409 when passwords do not match", async () => {
        const response = await fetch(`${baseUrl}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                lastname: testUser.lastname,
                firstname: testUser.firstname,
                email: testUser.email,
                password: testUser.password,
                passwordConfirm: "secret456"
            })
        });

        assert.equal(response.status, 409);
        assert.match(await response.text(), /Passwords don't match/);
    });

    it("returns 409 when email is already used", async () => {
        await createUser();

        const response = await fetch(`${baseUrl}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                lastname: testUser.lastname,
                firstname: testUser.firstname,
                email: testUser.email,
                password: testUser.password,
                passwordConfirm: testUser.password
            })
        });

        assert.equal(response.status, 409);
        assert.match(await response.text(), /Email already in use/);
    });

    it("returns 422 when payload is invalid", async () => {
        const response = await fetch(`${baseUrl}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                lastname: "D",
                firstname: "J",
                email: "not-an-email",
                password: "123",
                passwordConfirm: "123"
            })
        });

        assert.equal(response.status, 422);
    });
});

describe("POST /api/auth/login", () => {
    it("returns the email and sets the auth cookie on success", async () => {
        await createUser();

        const response = await fetch(`${baseUrl}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: testUser.email,
                password: testUser.password
            })
        });

        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), { email: testUser.email });
        assert.match(response.headers.get("set-cookie") ?? "", /access_token=/);
    });

    it("returns 404 when the user does not exist", async () => {
        const response = await fetch(`${baseUrl}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: testUser.email,
                password: testUser.password
            })
        });

        assert.equal(response.status, 404);
        assert.match(await response.text(), /Invalid credentials/);
    });

    it("returns 401 when the password is invalid", async () => {
        await createUser();

        const response = await fetch(`${baseUrl}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: testUser.email,
                password: "wrongpass"
            })
        });

        assert.equal(response.status, 401);
        assert.match(await response.text(), /Invalid credentials/);
    });

    it("returns 422 when payload is invalid", async () => {
        const response = await fetch(`${baseUrl}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: "not-an-email",
                password: "123"
            })
        });

        assert.equal(response.status, 422);
    });
});

describe("POST /api/auth/logout", () => {
    it("returns 204 and clears the auth cookie", async () => {
        await createUser();
        const { cookie } = await loginAndGetCookie();

        const response = await fetch(`${baseUrl}/api/auth/logout`, {
            method: "POST",
            headers: {
                Cookie: cookie
            }
        });

        assert.equal(response.status, 204);
        assert.match(response.headers.get("set-cookie") ?? "", /access_token=/);
    });

    it("returns 401 when no auth cookie is provided", async () => {
        const response = await fetch(`${baseUrl}/api/auth/logout`, {
            method: "POST"
        });

        assert.equal(response.status, 401);
        assert.match(await response.text(), /Unauthorized/);
    });
});

describe("GET /api/auth/me", () => {
    it("returns the connected user profile", async () => {
        await createUser();
        const { cookie } = await loginAndGetCookie();

        const response = await fetch(`${baseUrl}/api/auth/me`, {
            headers: {
                Cookie: cookie
            }
        });

        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), {
            email: testUser.email,
            firstname: testUser.firstname,
            lastname: testUser.lastname,
            role: 2
        });
    });

    it("returns 401 when no auth cookie is provided", async () => {
        const response = await fetch(`${baseUrl}/api/auth/me`);

        assert.equal(response.status, 401);
        assert.match(await response.text(), /Unauthorized/);
    });
});
