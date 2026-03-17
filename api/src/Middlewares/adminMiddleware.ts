import type { NextFunction, Request, Response } from 'express';
import { ForbiddenError, UnauthorizedError } from '../utils/Error.ts';



const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) throw new UnauthorizedError('Unauthorized');
    
    if (req.user.roleId !== 1) throw new ForbiddenError('Forbidden'); 

    next();
};

export default adminMiddleware;