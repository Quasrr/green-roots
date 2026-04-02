import type { Request, Response } from "express";
import z from "zod";
import { Prisma, prisma } from "../models/index.ts";
import ErrorHandler from "../ErrorHandler.ts";
import { ConflictError, NotFoundError } from "../utils/Error.ts";
import redis from "../models/redis.ts";

const treeSchema = z.object({
    name: z.string().min(1),
    price: z.coerce.number().positive(),
    description: z.string().min(1),
    impact_co2: z.coerce.number(),
    impact_o2: z.coerce.number(),
    image: z.string().min(1),
    quantity: z.coerce.number().int().min(0),
    label: z.string().min(1),
    country: z.string().min(1),
    height: z.coerce.number().positive(),
    growth: z.enum(["slow", "medium", "fast"]),
    exposition: z.string().min(1),
    rusticity: z.string().min(1),
    categories: z.array(z.coerce.number().int().positive()).default([]),
});

class TreesController {
    async getAll(_req: Request, res: Response) {
        try {
            // On vérifie d'abord le cache Redis
            const cached = await redis.get('trees:all');

            if (cached) {
                // Cache trouvé → on renvoie directement sans toucher à la BDD
                return res.send(JSON.parse(cached));
            }

            const trees = await prisma.tree.findMany({
                include: {
                    categories: {
                        include: {
                            category: true,
                        },
                    },
                },
            });

            const normalizedTrees = trees.map((tree) => {
                return {
                    ...tree,
                    categories: tree.categories.map((item) => item.category),
                };
            });

            // On stocke en cache pour 1h (3600 secondes)
            await redis.set('trees:all', JSON.stringify(normalizedTrees), { EX: 3600 });

            res.send(normalizedTrees);
        } catch (error) {
            ErrorHandler.sendError(res, error);
        };
    };

    async getById(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);

            if (!Number.isInteger(id) || id <= 0) throw new NotFoundError("Tree not found");

            // Clé unique par arbre
            const cacheKey = `trees:${id}`;

            const cached = await redis.get(cacheKey);

            if (cached) {
                return res.send(JSON.parse(cached));
            }

            const tree = await prisma.tree.findUnique({
                where: { id },
                include: {
                    categories: {
                        include: {
                            category: true,
                        },
                    },
                },
            });

            if (!tree) throw new NotFoundError("Tree not found");

            const normalizedTree = {
                ...tree,
                categories: tree.categories.map((item) => item.category),
            };

            await redis.set(cacheKey, JSON.stringify(normalizedTree), { EX: 3600 });

            res.send(normalizedTree);
        } catch (error) {
            ErrorHandler.sendError(res, error);
        };
    };

    async create(req: Request, res: Response) {
        try {
            const data = treeSchema.parse(req.body);

            const existingTree = await prisma.tree.findFirst({
                where: {
                    OR: [ // Soit l'un soit l'autre
                        { name: data.name },
                        { image: data.image },
                    ],
                },
            });

            if (existingTree) throw new ConflictError("Tree already exists");

            const createdTree = await prisma.tree.create({
                data: {
                    name: data.name,
                    price: data.price,
                    description: data.description,
                    impact_co2: data.impact_co2,
                    impact_o2: data.impact_o2,
                    image: data.image,
                    quantity: data.quantity,
                    label: data.label,
                    country: data.country,
                    height: data.height,
                    growth: data.growth,
                    exposition: data.exposition,
                    rusticity: data.rusticity,
                    categories: {
                        create: data.categories.map((categoryId) => ({
                            category: {
                                connect: { id: categoryId }, // connect permet, grâce au schéma Prisma, d'ajouter automatiquement la valeur dans la  table de liaison
                            },
                        })),
                    },
                },
                include: {
                    categories: {
                        include: {
                            category: true,
                        },
                    },
                },
            });

            // Invalide le cache après modification
            await redis.del('trees:all');

            res.status(201).send({
                ...createdTree,
                categories: createdTree.categories.map((item) => item.category),
            });
        } catch (error) {
            ErrorHandler.sendError(res, error);
        };
    };

    async update(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            const data = treeSchema.parse(req.body);

            const { categories, ...treeData } = data;

            const updateData: Prisma.TreeUpdateInput = {
                ...treeData,
            };

            if (categories.length > 0) {
                updateData.categories = {
                    deleteMany: {},
                    create: categories.map((categoryId) => ({
                        category: {
                            connect: { id: categoryId },
                        },
                    })),
                };
            };

            if (data.name || data.image) {
                const conflictingTree = await prisma.tree.findFirst({
                    where: {
                        id: { not: id },
                        OR: [
                            ...(data.name ? [{ name: data.name }] : []),
                            ...(data.image ? [{ image: data.image }] : []),
                        ],
                    },
                });

                if (conflictingTree) throw new ConflictError("Tree already exists");
            };

            const updatedTree = await prisma.tree.update({
                where: { id },
                data: updateData,
                include: {
                    categories: {
                        include: {
                            category: true,
                        },
                    },
                },
            });

            await redis.del('trees:all');
            await redis.del(`trees:${id}`);

            res.send({
                ...updatedTree,
                categories: updatedTree.categories.map((item) => item.category),
            });
        } catch (error) {
            ErrorHandler.sendError(res, error);
        };
    };

    async delete(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);

            await prisma.tree.delete({
                where: { id },
            });

            await redis.del('trees:all');
            await redis.del(`trees:${id}`);

            res.sendStatus(204);
        } catch (error) {
            ErrorHandler.sendError(res, error);
        };
    };
};

export default new TreesController();
