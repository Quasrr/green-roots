import type { NextFunction, Request, Response } from 'express';
import { ForbiddenError, UnauthorizedError } from '../utils/Error.ts';
import { prisma } from '../models/index.ts';



const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) throw new UnauthorizedError('Unauthorized');

    
    // Récupérer le user en BDD pour vérifier son rôle
    const user = await prisma.user.findUnique({ where: { email: req.user.email } });

    if (!user || user.roleId !== 1) throw new ForbiddenError('Forbidden');

    next();
};

export default adminMiddleware;