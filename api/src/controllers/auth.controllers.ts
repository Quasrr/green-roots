import type { Request, Response } from 'express';
import z from 'zod';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { prisma } from '../models/index.ts';



export class AuthController {

    static async register(req: Request, res: Response) {
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
                throw new Error('Passwords don\'t match');
            }
            //avant de créer un user, s'assurer qu'il n'existe pas déjà
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                throw new Error('Email already in use');
            }

            //hasher le mot de passe avant de le stocker en base de données
            const hashedPassword = await argon2.hash(password);

            //créer l'utilisateur dans la base de données

            const createdUser = await prisma.user.create({
                data: { lastname, firstname, email, password: hashedPassword },
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
            res.status(500).json({ error: { message: 'Registration failed' } });
        }
    }
}