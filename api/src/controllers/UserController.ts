import type { Request, Response } from "express";
import { prisma } from '../models/index.ts';
import { NotFoundError } from "../utils/Error.ts";
import z from 'zod';

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
        const users = await prisma.user.findMany({
            select: userSelect
        });
        res.json(users);
    }

    async getById(req: Request, res: Response) {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { id: Number(id) },
            select: userSelect
        });
        if (!user) {
            throw new NotFoundError('User not found');
        }
        res.json(user);
    }
    async update(req: Request, res: Response) {
        const { id } = req.params;
        const data = shemas.update.parse(req.body);


        const exists = await prisma.user.findUnique({  
            where: { id: Number(id) }
        });
        if (!exists) {
            throw new NotFoundError('User not found');
        }

        const user = await prisma.user.update({
            where: { id: Number(id) },
            data: data,
            select: userSelect
        });
        res.json(user);
    }

    async delete(req: Request, res: Response) {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { id: Number(id) }
        });
        if (!user) {
            throw new NotFoundError('User not found');
        }

        await prisma.user.delete({
            where: { id: Number(id) }
        });
        res.status(204).send();

    }
}

export default new UserController();