import type { Request, Response } from "express";
import { prisma } from '../models/index.ts';
import ErrorHandler from "../ErrorHandler.ts";
import z from 'zod';
import { BadRequestError, NotFoundError } from "../utils/Error.ts";

const schemas = z.array(
    z.object({
        treeId: z.number().int().positive(),
        quantity: z.number().int().positive(),
    })
).min(1);

class OrdersController {
    async getOrders(req: Request, res: Response) {
        try {
            const orders = await prisma.order.findMany({
                orderBy: {
                    createdAt: 'desc'
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstname: true,
                            lastname: true,
                            email: true
                        }
                    },
                    lines: {
                        include: {
                            tree: {
                                select: {
                                    id: true,
                                    name: true,
                                    price: true
                                }
                            }
                        }
                    }
                }
            });

            res.send(orders);
        } catch (error) {
            ErrorHandler.sendError(res, error);
        };
    };

    async createOrder(req: Request, res: Response) {
        try {
            const lines = schemas.parse(req.body);
            const userId = Number(req.user?.id);

            //Aller chercher les arbres
            const trees = await prisma.tree.findMany({
                where: { id: { in: lines.map(l => l.treeId) } },
                select: { id: true, price: true, quantity: true }
            });

            //Calculer le total de la commande
            let total = 0;

            for (const line of lines) {
                let found = false;

                for (const tree of trees) {
                    if (tree.id === line.treeId) {
                        if (tree.quantity < line.quantity) {
                            throw new BadRequestError(`Stock insuffisant pour l'arbre ${line.treeId} (disponible: ${tree.quantity})`);
                        };

                        total += tree.price.toNumber() * line.quantity;
                        found = true;
                    };
                };

                if (!found) throw new NotFoundError(`Tree ${line.treeId} not found`);
            };

            //Créer la commande + ses lignes
            const order = await prisma.$transaction(async (tx) => {
                const createdOrder = await tx.order.create({
                    data: {
                        userId,
                        status: 'paid',
                        total,
                        lines: {
                            create: lines.map(line => ({
                                treeId: line.treeId,
                                quantity: line.quantity
                            }))
                        }
                    },
                    include: {
                        lines: true
                    }
                });

                // Décrémenter le stock de chaque arbre commandé
                await Promise.all(
                    lines.map(line =>
                        tx.tree.update({
                            where: { id: line.treeId },
                            data: { quantity: { decrement: line.quantity } }
                        })
                    )
                );

                return createdOrder;
            });

            res.status(201).send(order);

        } catch (error) {
            ErrorHandler.sendError(res, error);
        };

    };

    async getMyOrders(req: Request, res: Response) {
        try {
            const userId = Number(req.user?.id);
            const orders = await prisma.order.findMany({
                where: { userId },
                orderBy: {
                    createdAt: 'desc'
                },
                include: {
                    lines: {
                        include: {
                            tree: {
                                select: {
                                    id: true,
                                    name: true,
                                    price: true
                                }
                            }
                        }
                    }
                }
            });

            res.send(orders);
        } catch (error) {
            ErrorHandler.sendError(res, error);
        };
    };

    async getOrderById(req: Request, res: Response) {
        try {
            const userId = Number(req.user?.id);
            const orderId = Number(req.params.id);

            if (!Number.isInteger(orderId) || orderId <= 0) {
                throw new BadRequestError('Invalid order id');
            };

            const order = await prisma.order.findUnique({
                where: { id: orderId },
                include: {
                    lines: {
                        include: {
                            tree: {
                                select: {
                                    id: true,
                                    name: true,
                                    price: true
                                }
                            }
                        }
                    },
                    user: {
                        select: {
                            id: true,
                            firstname: true,
                            lastname: true,
                            email: true
                        }
                    }
                }
            });

            const currentUser = await prisma.user.findUnique({
                where: { id: userId },
                select: { roleId: true }
            });
            
            const isAdmin = currentUser?.roleId === 1;

            if (!order || (!isAdmin && order.userId !== userId)) throw new NotFoundError('Order not found');

            res.send(order);
        } catch (error) {
            ErrorHandler.sendError(res, error);
        };
    };
};

export default new OrdersController();