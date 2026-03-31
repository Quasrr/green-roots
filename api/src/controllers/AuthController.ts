import type { Request, Response } from 'express';
import z from 'zod';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { RoleName } from '../../prisma/generated/enums.ts';
import { prisma } from '../models/index.ts';
import { ConflictError, NotFoundError, UnauthorizedError } from '../utils/Error.ts';
import ErrorHandler from '../ErrorHandler.ts';

function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new UnauthorizedError('JWT secret is not configured');
    };

    return secret;
};

class AuthController {
    async register(req: Request, res: Response) {
        // schéma pour valider les données entrantes dans notre controller
        const schema = z.object({
            lastname: z.string().min(2),
            firstname: z.string().min(2),
            email: z.string().email(),
            password: z
                .string()
                .min(8, "Invalid password format (min. 8 characters)")
                .refine(
                    (v) =>
                        /[a-z]/.test(v) &&
                        /[A-Z]/.test(v) &&
                        /[0-9]/.test(v) &&
                        /[^a-zA-Z0-9]/.test(v),
                    "Invalid password format. Please include uppercase, lowercase, a number, and a special character (min. 6 characters)"
                ),
        });

        try {
            //valider et récupérer les informations du client
            const { lastname, firstname, email, password } = schema.parse(req.body);


            //avant de créer un user, s'assurer qu'il n'existe pas déjà
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                throw new ConflictError('Email already in use');
            };

            //hasher le mot de passe avant de le stocker en base de données
            const hashedPassword = await argon2.hash(password);

            //créer l'utilisateur dans la base de données
            const createdUser = await prisma.user.create({
                data: {
                    lastname,
                    firstname,
                    email,
                    password: hashedPassword,
                    role: {
                        connect: { nameRole: RoleName.user }
                    }
                },
            });

            res.status(201).json({
                message: "OK", user: {
                    id: createdUser.id,
                    email: createdUser.email,
                    firstname: createdUser.firstname,
                    lastname: createdUser.lastname,
                }
            });

        } catch (error) {
            ErrorHandler.sendError(res, error);
        };
    };

    async login(req: Request, res: Response) {
        // schéma pour valider les données entrantes dans notre controller
        const schema = z.object({
            email: z.string().email(),
            password: z.string().min(6),
        });

        try {
            //valider et récupérer les informations du client
            const { email, password } = schema.parse(req.body);

            //vérifier que l'utilisateur existe bien en base de données
            const user = await prisma.user.findUnique({ where: { email } });

            if (!user) throw new NotFoundError('Invalid credentials');

            //vérifier que le mot de passe correspond à celui stocké en base de données
            const isPasswordValid = await argon2.verify(user.password, password);

            if (!isPasswordValid) throw new UnauthorizedError('Invalid credentials');

            const jwtSecret = getJwtSecret();
            const token = jwt.sign(
                { email, id: user.id },
                jwtSecret,
                { expiresIn: "1h" }
            );

            const refreshToken = jwt.sign(
                { email, id: user.id },
                jwtSecret,
                { expiresIn: "7d" }
            );

            // Creation du refresh token en bdd
            await prisma.refreshToken.create({
                data: {
                    token: refreshToken,
                    userId: user.id,
                    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // 7j
                }
            });

            res.cookie("access_token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/api",
                maxAge: 1000 * 60 * 60
            });

            res.cookie("refresh_token", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/api/auth/refresh",
                maxAge: 1000 * 60 * 60 * 24 * 7 // 7j
            });

            return res.send({ email });

        } catch (error) {
            return ErrorHandler.sendError(res, error);
        };
    };

    async refreshAccessToken(req: Request, res: Response) {
        try {
            const refreshToken = req.cookies?.refresh_token;
            if (!refreshToken) throw new UnauthorizedError('No refresh token');

            const jwtSecret = getJwtSecret();
            const decoded = jwt.verify(refreshToken, jwtSecret) as { email: string, id: string };

            // Vérifier que le refresh token existe bien en BDD
            const storedToken = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
            if (!storedToken) throw new UnauthorizedError('Invalid refresh token');

            // Générer un nouvel access token
            const newAccessToken = jwt.sign(
                { email: decoded.email, id: decoded.id },
                jwtSecret,
                { expiresIn: "1h" }
            );

            res.cookie("access_token", newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/api",
                maxAge: 1000 * 60 * 60
            });

            return res.send({ message: "Token refreshed" });

        } catch (error) {
            return ErrorHandler.sendError(res, error);
        };
    };

    async logout(req: Request, res: Response) {
        const refreshToken = req.cookies?.refresh_token;
        // Supression access token
        res.clearCookie("access_token", { path: "/api" });

        // Supression refresh token + suppression en bdd
        res.clearCookie(`refresh_token`, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7j
            path: "/api/auth/refresh"
        });

        // On supprime également le refreshToken dans la DB (celui qui avait été confié au client et qu'il nous renvoie sur la route logout via cookie) pour forcer le relogin
        // Suppression via l'userId récupéré depuis le token (authMiddleware)
        if (refreshToken) {
            await prisma.refreshToken.delete({
                where: { token: req.cookies.refresh_token }
            });
        };

        res.sendStatus(204);
    };

    async me(req: Request, res: Response): Promise<void> {
        // Récupérer les informations de l'utilisateur à partir de la requête (grâce au middleware d'authentification)
        const userInfo = req.user;
        // Si l'utilisateur n'est pas trouvé, renvoyer une erreur
        if (!userInfo) {
            throw new NotFoundError('User not found');
        }
        //On utilise l'email du token pour aller chercher toutes les infos en BDD
        const user = await prisma.user.findUnique({ where: { email: userInfo.email } });
        if (!user) throw new NotFoundError('User not found');

        // Renvoyer les informations de l'utilisateur au client
        res.json({ id: user.id, email: user.email, firstname: user.firstname, lastname: user.lastname, role: user.roleId });
    };
};

export default new AuthController();
