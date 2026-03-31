import type { Request, Response } from "express";
import { OrderStatus, prisma } from '../models/index.ts';
import ErrorHandler from "../ErrorHandler.ts";
import z from 'zod';
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "../utils/Error.ts";

const schemas = z.array(
    z.object({
        treeId: z.coerce.number().int().positive(),
        quantity: z.coerce.number().int().positive(),
    })
).min(1);

class OrdersController {
    async getOrders(_req: Request, res: Response) {
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
            const orderLines = schemas.parse(req.body);
            const userId = Number(req.user.id);

            // Aller chercher les arbres dans la base de donnée
            const trees = await prisma.tree.findMany({
                where: { id: { in: orderLines.map(line => line.treeId) } },
                select: { id: true, price: true, quantity: true }
            });

            // Calculer le total de la commande
            let total = 0;

            for (const line of orderLines) {

                const findTree = trees.find(tree => tree.id === line.treeId);

                if (!findTree) throw new NotFoundError(`Tree ${line.treeId} not found`);

                if (findTree.quantity < line.quantity) {
                    throw new BadRequestError(`Stock insuffisant pour l'arbre ${line.treeId} (disponible: ${findTree.quantity})`);
                };

                total += findTree.price.toNumber() * line.quantity;
            };

            // Créer la commande + ses lignes
            const order = await prisma.$transaction(async (tx) => {
                const createdOrder = await tx.order.create({
                    data: {
                        userId,
                        status: 'waiting',
                        total,
                        lines: {
                            create: orderLines.map(line => ({
                                treeId: line.treeId,
                                quantity: line.quantity
                            }))
                        }
                    },
                    include: {
                        lines: true
                    }
                });

                return createdOrder;
            });

            res.status(201).send(order);

        } catch (error) {
            ErrorHandler.sendError(res, error);
        };
    };

    async payOrder(req: Request, res: Response) {
        let orderId = 0;
        const userId = Number(req.user.id);

        try {
            orderId = z.coerce.number().int().positive().parse(req.params.id);

            await prisma.$transaction(async (tx) => {
                const order = await tx.order.findUnique({
                    where: { id: orderId },
                    include: {
                        lines: true
                    }
                });

                if (!order) throw new NotFoundError(`Order not found`);
                if (order.userId !== userId) throw new ForbiddenError('Forbidden');
                if (order.status !== OrderStatus.waiting) throw new ConflictError('The order has already processed');

                for (const line of order.lines) {
                    const updatedTree = await tx.tree.updateMany({
                        where: {
                            id: line.treeId,
                            quantity: { gte: line.quantity }
                        },
                        data: {
                            quantity: { decrement: line.quantity }
                        }
                    });

                    if (updatedTree.count === 0) {
                        throw new BadRequestError(`Stock insuffisant pour l'arbre ${line.treeId}`);
                    }
                };

                await tx.order.update({
                    where: { id: orderId },
                    data: { status: OrderStatus.paid }
                });
            });

            res.sendStatus(200);
        } catch (error) {
            if (error instanceof BadRequestError && orderId > 0) {
                await prisma.order.updateMany({
                    where: {
                        id: orderId,
                        userId,
                        status: OrderStatus.waiting
                    },
                    data: { status: OrderStatus.canceled }
                });
            };

            ErrorHandler.sendError(res, error);
        };
    };

    async getMyOrders(req: Request, res: Response) {
        try {
            const userId = Number(req.user.id);

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
            const userId = Number(req.user.id);
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
