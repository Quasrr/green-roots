import type { Request, Response } from "express";
import z from "zod";
import redis from "../models/redis.ts";
import { prisma } from "../models/index.ts";
import ErrorHandler from "../ErrorHandler.ts";
import { BadRequestError, NotFoundError } from "../utils/Error.ts";

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

// Créer une clé Redis dédiée au panier de l'utilisateur
function getCartKey(email: string) {
    return `cart:${email.toLowerCase()}`;
};

// Lire le panier existant et fallback sur tableau vide si la clé n'existe pas
async function readCart(email: string): Promise<Array<CartItem>> {
    const rawCart = await redis.get(getCartKey(email)); // Récupération dans la base redis avec la méthode get

    if (!rawCart) return [];

    try {
        const parsed = JSON.parse(rawCart);

        if (!Array.isArray(parsed)) return []; // Array.isArray() méthode static qui vérifie si la donnée est bien un tableau.
                                               // Ici c'est une sécurité au cas où la donnée est corrompu, on s'assure de retourner un tableau

        return parsed as Array<CartItem>;
    } catch {
        return [];
    };
};

class CartController {
    async getAll(req: Request, res: Response) {
        try {
            // Récupération de l'email via req.user
            const { email } = req.user;

            const items = await readCart(email);

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

            const currentCart = await readCart(email);
            const itemIndex = currentCart.findIndex((cartItem) => cartItem.id === itemId);

            // quantity = 0 => suppression directe de l'item
            if (quantity === 0) {
                if (itemIndex >= 0) currentCart.splice(itemIndex, 1);
                await redis.set(getCartKey(email), JSON.stringify(currentCart)); // Sauvegarde dans la base redis avec la méthode set

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

                await redis.set(getCartKey(email), JSON.stringify(currentCart));
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
                    label: true
                },
            });

            if (!tree) throw new NotFoundError("Tree not found");
            if (tree.quantity <= 0) throw new BadRequestError("Tree out of stock");

            const currentQuantity = itemIndex >= 0 ? currentCart[itemIndex].quantity : 0;
            const nextQuantity = currentQuantity + quantity;

            if (nextQuantity > tree.quantity) {
                throw new BadRequestError(`Insufficient stock for the tree "${tree.name}" (available: ${tree.quantity})`);
            }

            // Données persistées dans le panier Redis
            const dbItem = {
                id: tree.id,
                title: tree.name,
                image: tree.image,
                price: Number(tree.price),
                inStock: true,
                label: tree.label
            };

            if (itemIndex >= 0) { // Mettre à jour la quantité de l'item dans le panier
                currentCart[itemIndex] = {
                    ...dbItem,
                    quantity: nextQuantity,
                };
            } else {
                currentCart.push({ // Ajouter l'item au panier s'il n'existe pas déjà
                    ...dbItem,
                    quantity: nextQuantity,
                });
            };

            await redis.set(getCartKey(email), JSON.stringify(currentCart));

            res.send({ items: currentCart });
        } catch (error) {
            ErrorHandler.sendError(res, error);
        };
    };
};

export default new CartController();