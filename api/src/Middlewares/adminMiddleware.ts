import type { NextFunction, Request, Response } from 'express';
import { ForbiddenError, UnauthorizedError } from '../utils/Error.ts';
import { prisma } from '../models/index.ts';
import ErrorHandler from '../ErrorHandler.ts';

const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) throw new UnauthorizedError('Unauthorized');

        // Récupérer le user en BDD pour vérifier son rôle
        const user = await prisma.user.findUnique({ where: { email: req.user.email } });

        if (!user || user.roleId !== 1) throw new ForbiddenError('Forbidden');

        next();
    } catch (error) {
        ErrorHandler.sendError(res, error);
    };
};

export default adminMiddleware;