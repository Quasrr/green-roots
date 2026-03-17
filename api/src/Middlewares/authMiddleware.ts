import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/Error.ts';
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


   
        // Attacher les informations de l'utilisateur à la requête
        req.user = { email: decodedToken.email }; 

        next();

    } catch (error) {
        ErrorHandler.sendError(res, error);

    }
};

export default authMiddleware;