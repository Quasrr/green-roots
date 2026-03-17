import type { Response } from "express";
import { Prisma } from "./models/index.ts";
import z from "zod";
import { 
    BadRequestError,
    ConflictError,
    ForbiddenError,
    NotFoundError,
    UnauthorizedError,
    UnexpectedServerError,
} from "./utils/Error.ts";


export default class ErrorHandler {
    static sendError(res: Response, error: unknown) {
        if (!(error instanceof Error)) {
            throw error;
        };

        const errorResponse = { message: error.message };

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                return res.status(409).send({ message: "Unique constraint failed" });
            }

            if (error.code === "P2003") {
                return res.status(400).send({ message: "Invalid relation reference" });
            }

            if (error.code === "P2025") {
                return res.status(404).send({ message: "Resource not found" });
            }
        }

        if (error instanceof Prisma.PrismaClientValidationError) {
            return res.status(400).send({ message: "Invalid Prisma query" });
        }

        if (error instanceof UnexpectedServerError) return res.status(500).send(errorResponse);
        if (error instanceof BadRequestError) return res.status(400).send(errorResponse);
        if (error instanceof UnauthorizedError) return res.status(401).send(errorResponse);
        if (error instanceof ForbiddenError) return res.status(403).send(errorResponse);
        if (error instanceof NotFoundError) return res.status(404).send(errorResponse);
        if (error instanceof ConflictError) return res.status(409).send(errorResponse);
        if (error instanceof z.ZodError) return res.status(422).send({ error: z.prettifyError(error) });

        return res.status(500).send(errorResponse);
    };
};
