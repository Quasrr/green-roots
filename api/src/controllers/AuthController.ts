import type { Request, Response } from 'express';
import z from 'zod';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { prisma } from '../models/index.ts';
import { ConflictError, NotFoundError, UnauthorizedError } from '../utils/Error.ts';
import ErrorHandler from '../ErrorHandler.ts';

class AuthController {
    async register(req: Request, res: Response) {
        // schéma pour valider les données entrantes dans notre controller
        const schema = z.object({
            lastname: z.string().min(2),
            firstname: z.string().min(2),
            email: z.string().email(),
            password: z.string().min(6),
            passwordConfirm: z.string().min(6)
        });

        try {
            //valider et récupérer les informations du client
            const { lastname, firstname, email, password, passwordConfirm } = schema.parse(req.body);

            //s'assurer que les password correspondent
            if (password !== passwordConfirm) {
                throw new ConflictError('Passwords don\'t match');
            }

            //avant de créer un user, s'assurer qu'il n'existe pas déjà
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                throw new ConflictError('Email already in use');
            }

            //hasher le mot de passe avant de le stocker en base de données
            const hashedPassword = await argon2.hash(password);

            //créer l'utilisateur dans la base de données
            const createdUser = await prisma.user.create({
                data: { lastname, firstname, email, password: hashedPassword, roleId: 2 },
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
        }
    }
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

            const token = jwt.sign(
                { email },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );

            res.cookie("access_token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/api",
                maxAge: 1000 * 60 * 60
            });

            return res.send({ email });

        } catch (error) {
            console.log(error)
            return ErrorHandler.sendError(res, error);
        };
    };

    async logout(_req: Request, res: Response) {
        res.clearCookie("access_token", { path: "/api" });
        res.sendStatus(204);
    }
};

export default new AuthController();