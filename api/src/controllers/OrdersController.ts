import type { Request, Response } from "express";
import { prisma } from '../models/index.ts';
import ErrorHandler from "../ErrorHandler.ts";


class OrdersController {
    async getOrders(req: Request, res: Response) {
        try {
            const orders = await prisma.order.findMany({
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
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
};

export default new OrdersController();