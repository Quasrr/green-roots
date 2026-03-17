import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../models/index.ts';
import { NotFoundError, UnauthorizedError } from '../utils/Error.ts';
import ErrorHandler from '../ErrorHandler.ts';

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        //Lire le token dans le cookie
        const token = req.cookies.access_token;
        if (!token) {
            throw new UnauthorizedError('Unauthorized');

        }
        //Vérifier et décoder le token JWT
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string) as { email: string };


        //Récupérer l'utilisateur en BDD
        const user = await prisma.user.findUnique({ where: { email: decodedToken.email } });
        if (!user) {
            throw new NotFoundError('User not found');
        }
        // Attacher les informations de l'utilisateur à la requête
        req.user = user; 

        next();

    } catch (error) {
        ErrorHandler.sendError(res, error);

    }
};

export default authMiddleware;