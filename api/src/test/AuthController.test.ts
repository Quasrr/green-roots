import * as assert from "node:assert/strict";
import { describe, it } from "node:test";
import argon2 from "argon2";
import emailjs from "@emailjs/nodejs";
import { prisma } from "../models/index.ts";
import redis from "../models/redis.ts";
import { hashToken } from "../utils/resetToken.ts";
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

async function waitFor(assertion: () => Promise<void>, timeoutMs = 1000) {
    const startedAt = Date.now();
    let lastError: unknown;

    while (Date.now() - startedAt < timeoutMs) {
        try {
            await assertion();
            return;
        } catch (error) {
            lastError = error;
            await new Promise((resolve) => setTimeout(resolve, 25));
        }
    }

    throw lastError;
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

describe("POST /api/auth/refresh", () => {
    it("returns a new access token when the refresh cookie is valid", async () => {
        await createUser();
        const { session } = await loginAndGetSession(testUser.email, testUser.password);

        const response = await session.csrfFetch(`${baseUrl}/api/auth/refresh`, {
            method: "POST",
        });

        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), { message: "Token refreshed" });
        assert.match(response.headers.get("set-cookie") ?? "", /access_token=/);
    });

    it("returns 401 when no refresh cookie is provided", async () => {
        const session = await createTestSession();
        const response = await session.csrfFetch(`${baseUrl}/api/auth/refresh`, {
            method: "POST",
        });

        assert.equal(response.status, 401);
        assert.match(await response.text(), /No refresh token/);
    });

    it("returns 401 when the refresh token is no longer stored", async () => {
        await createUser();
        const { session } = await loginAndGetSession(testUser.email, testUser.password);

        await prisma.refreshToken.deleteMany({
            where: { userId: testUser.id },
        });

        const response = await session.csrfFetch(`${baseUrl}/api/auth/refresh`, {
            method: "POST",
        });

        assert.equal(response.status, 401);
        assert.match(await response.text(), /Invalid refresh token/);
    });
});

describe("POST /api/auth/forgot-password", () => {
    it("returns 500 when email is missing", async () => {
        const session = await createTestSession();
        const response = await session.csrfFetch(`${baseUrl}/api/auth/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
        });

        assert.equal(response.status, 500);
    });

    it("returns the same message for an unknown email without sending a reset email", async (t) => {
        const sendMock = t.mock.method(emailjs, "send", async () => ({}));
        const session = await createTestSession();

        const response = await session.csrfFetch(`${baseUrl}/api/auth/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "unknown@greenroots.fr" }),
        });

        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), {
            message: "Si ce compte existe, un email a été envoyé",
        });
        assert.equal(sendMock.mock.calls.length, 0);
        assert.deepEqual(await redis.keys("reset:*"), []);
    });

    it("stores a reset token, applies cooldown, and sends a reset email", async (t) => {
        process.env.FRONT_URL = "http://localhost:5173";
        await createUser();
        const sendMock = t.mock.method(emailjs, "send", async () => ({}));
        const session = await createTestSession();

        const response = await session.csrfFetch(`${baseUrl}/api/auth/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: testUser.email }),
        });

        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), {
            message: "Si ce compte existe, un email a été envoyé",
        });
        await waitFor(async () => {
            assert.equal(sendMock.mock.calls.length, 1);
            assert.equal(await redis.get(`reset-cooldown:${testUser.email}`), "1");
            assert.equal((await redis.keys("reset:*")).length, 1);
        });

        const [, , payload] = sendMock.mock.calls[0]!.arguments as [
            string,
            string,
            { to_email: string; reset_url: string; app_name: string },
        ];
        assert.equal(payload.to_email, testUser.email);
        assert.equal(payload.app_name, "GreenRoots");
        assert.match(payload.reset_url, /http:\/\/localhost:5173\/reset-password\?token=/);
    });

    it("does not send a second email while the cooldown is active", async (t) => {
        process.env.FRONT_URL = "http://localhost:5173";
        await createUser();
        const sendMock = t.mock.method(emailjs, "send", async () => ({}));
        const session = await createTestSession();

        await session.csrfFetch(`${baseUrl}/api/auth/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: testUser.email }),
        });

        await waitFor(async () => {
            assert.equal(sendMock.mock.calls.length, 1);
            assert.equal(await redis.get(`reset-cooldown:${testUser.email}`), "1");
            assert.equal((await redis.keys("reset:*")).length, 1);
        });

        const response = await session.csrfFetch(`${baseUrl}/api/auth/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: testUser.email }),
        });

        assert.equal(response.status, 200);
        await waitFor(async () => {
            assert.equal(sendMock.mock.calls.length, 1);
            assert.equal((await redis.keys("reset:*")).length, 1);
        });
    });
});

describe("POST /api/auth/reset-password", () => {
    it("updates the password and invalidates the reset token", async () => {
        await createUser();
        const rawToken = "valid-reset-token";
        const hashedToken = hashToken(rawToken);
        await redis.set(`reset:${hashedToken}`, testUser.email, { EX: 3600 });

        const session = await createTestSession();
        const response = await session.csrfFetch(`${baseUrl}/api/auth/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                token: rawToken,
                newPassword: "UpdatedGreenRoots123!",
            }),
        });

        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), {
            message: "Mot de passe mis à jour avec succès",
        });
        assert.equal(await redis.get(`reset:${hashedToken}`), null);

        const { response: loginResponse } = await loginAndGetSession(
            testUser.email,
            "UpdatedGreenRoots123!"
        );
        assert.equal(loginResponse.status, 200);
    });

    it("returns 500 when the token is invalid or expired", async () => {
        const session = await createTestSession();
        const response = await session.csrfFetch(`${baseUrl}/api/auth/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                token: "invalid-token",
                newPassword: "UpdatedGreenRoots123!",
            }),
        });

        assert.equal(response.status, 500);
    });

    it("returns 500 when payload is invalid", async () => {
        const session = await createTestSession();
        const response = await session.csrfFetch(`${baseUrl}/api/auth/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                token: "",
                newPassword: "short",
            }),
        });

        assert.equal(response.status, 500);
    });

    it("returns 500 when the token points to a deleted user", async () => {
        const user = await createUser();
        const rawToken = "deleted-user-reset-token";
        const hashedToken = hashToken(rawToken);
        await redis.set(`reset:${hashedToken}`, testUser.email, { EX: 3600 });

        await prisma.user.delete({
            where: { id: user.id },
        });

        const session = await createTestSession();
        const response = await session.csrfFetch(`${baseUrl}/api/auth/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                token: rawToken,
                newPassword: "UpdatedGreenRoots123!",
            }),
        });

        assert.equal(response.status, 500);
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

    it("returns 500 when the authenticated user no longer exists", async () => {
        const user = await createUser();
        const { session } = await loginAndGetSession(testUser.email, testUser.password);

        await prisma.user.delete({
            where: { id: user.id },
        });

        const response = await session.fetch(`${baseUrl}/api/auth/me`);

        assert.equal(response.status, 500);
    });
});
