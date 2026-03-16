import type { Response } from "express";
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

        if (error instanceof UnexpectedServerError) return res.status(500).send(error);
        if (error instanceof BadRequestError) return res.status(400).send(error);
        if (error instanceof UnauthorizedError) return res.status(401).send(error);
        if (error instanceof ForbiddenError) return res.status(403).send(error);
        if (error instanceof NotFoundError) return res.status(404).send(error);
        if (error instanceof ConflictError) return res.status(409).send(error);
        if (error instanceof z.ZodError) return res.status(422).send({ error: z.prettifyError(error) });

        return res.status(500).send(error);
    };
};