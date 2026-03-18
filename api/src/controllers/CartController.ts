import type { Request, Response } from "express";
import z from "zod";
import redis from "../models/redis.ts";
import { prisma } from "../models/index.ts";
import ErrorHandler from "../ErrorHandler.ts";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../utils/Error.ts";

type CartItem = {
    id: number;
    title: string;
    image: string;
    price: number;
    inStock: boolean;
    quantity: number;
};

const updateCartSchema = z.object({
    item: z.object({
        id: z.coerce.number().int().positive(),
        quantity: z.coerce.number().int().optional(),
    }),
});

class CartController {
    // Créer une clé Redis dédiée au panier de l'utilisateur
    private getCartKey(email: string) {
        return `cart:${email.toLowerCase()}`;
    };

    // Lire le panier existant et fallback sur tableau vide si la clé n'existe pas
    private async readCart(email: string): Promise<CartItem[]> {
        const rawCart = await redis.get(this.getCartKey(email));

        if (!rawCart) return [];

        try {
            const parsed = JSON.parse(rawCart);

            if (!Array.isArray(parsed)) return [];

            return parsed as Array<CartItem>;
        } catch {
            return [];
        };
    };

    async getAll(req: Request, res: Response) {
        try {
            // Récupération de l'email via req.user
            const { email } = req.user;

            const items = await this.readCart(email);

            res.send({ items });
        } catch (error) {
            ErrorHandler.sendError(res, error);
        };
    };

    async update(req: Request, res: Response) {
        try {
            const { item } = updateCartSchema.parse(req.body);
            
            // Récupération de l'email via req.user
            const { email } = req.user;

            const itemId = item.id;
            const quantity = Number(item.quantity);

            if (Number.isNaN(quantity)) throw new BadRequestError("Item must contain a valid quantity");

            const currentCart = await this.readCart(email);
            const itemIndex = currentCart.findIndex((cartItem) => cartItem.id === itemId);

            // quantity = 0 => suppression directe de l'item
            if (quantity === 0) {
                if (itemIndex >= 0) currentCart.splice(itemIndex, 1);
                await redis.set(this.getCartKey(email), JSON.stringify(currentCart));
                return res.send({ items: currentCart });
            };

            // quantity < 0 => décrémentation, puis suppression si on tombe à 0 (ou moins)
            if (quantity < 0) {
                if (itemIndex < 0) throw new NotFoundError("Item not found in cart");
                const nextQuantity = currentCart[itemIndex].quantity + quantity;

                if (nextQuantity <= 0) {
                    currentCart.splice(itemIndex, 1);
                } else {
                    currentCart[itemIndex] = {
                        ...currentCart[itemIndex],
                        quantity: nextQuantity,
                    };
                };

                await redis.set(this.getCartKey(email), JSON.stringify(currentCart));
                return res.send({ items: currentCart });
            };

            // Pour un ajout, on recharge les infos de l'arbre depuis la base
            const tree = await prisma.tree.findUnique({
                where: { id: itemId },
                select: {
                    id: true,
                    name: true,
                    price: true,
                    image: true,
                    quantity: true,
                },
            });

            if (!tree) throw new NotFoundError("Tree not found");
            if (tree.quantity <= 0) throw new BadRequestError("Tree out of stock");

            // Données persistées dans le panier Redis
            const dbItem = {
                id: tree.id,
                title: tree.name,
                image: tree.image,
                price: Number(tree.price),
                inStock: true,
            };

            if (itemIndex >= 0) {
                currentCart[itemIndex] = {
                    ...dbItem,
                    quantity: currentCart[itemIndex].quantity + quantity,
                };
            } else {
                currentCart.push({
                    ...dbItem,
                    quantity,
                });
            };

            await redis.set(this.getCartKey(email), JSON.stringify(currentCart));

            res.send({ items: currentCart });
        } catch (error) {
            ErrorHandler.sendError(res, error);
        };
    };
};

export default new CartController();