import type { Request, Response } from "express";
import { prisma } from '../models/index.ts';
import { ForbiddenError, NotFoundError } from "../utils/Error.ts";
import z from 'zod';
import ErrorHandler from "../ErrorHandler.ts";

const shemas = {
    update: z.object({
        email: z.string().email().optional(),
        firstname: z.string().min(2).optional(),
        lastname: z.string().min(2).optional(),
        address: z.string().min(5).optional(),
    })
};

const userSelect = {
    id: true,
    address: true,
    email: true,
    firstname: true,
    lastname: true,
    role: {
        select: { nameRole: true }
    }
};

class UserController {
    async getAll(req: Request, res: Response) {
        try {
            const users = await prisma.user.findMany({
                select: userSelect
            });
            res.json(users);
        } catch (error) {
            ErrorHandler.sendError(res, error);
        };
    };

    async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const user = await prisma.user.findUnique({
                where: { id: Number(id) },
                select: userSelect
            });

            if (!user) throw new NotFoundError('User not found');

            res.json(user);
        } catch (error) {
            ErrorHandler.sendError(res, error);
        };
    };

    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const data = shemas.update.parse(req.body);

            const exists = await prisma.user.findUnique({
                where: { id: Number(id) }
            });

            if (!exists) throw new NotFoundError('User not found');

            const user = await prisma.user.update({
                where: { id: Number(id) },
                data: data,
                select: userSelect
            });

            res.json(user);
        } catch (error) {
            ErrorHandler.sendError(res, error);
        };
    };

    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const userId = Number(id);

            if (Number(req.user?.id) !== userId) {
                throw new ForbiddenError('Forbidden');
            }

            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!user) throw new NotFoundError('User not found');

            await prisma.$transaction(async (tx) => {
                await tx.refreshToken.deleteMany({
                    where: { userId }
                });

                await tx.order.deleteMany({
                    where: { userId }
                });

                await tx.user.delete({
                    where: { id: userId }
                });
            });

            res.clearCookie("access_token", { path: "/api" });
            res.clearCookie("refresh_token", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 1000 * 60 * 60 * 24 * 7,
                path: "/api/auth/refresh"
            });

            res.status(204).send();
        } catch (error) {
            ErrorHandler.sendError(res, error);
        };
    };
};

export default new UserController();
