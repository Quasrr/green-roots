import { Router } from "express";
import AuthController from "./controllers/AuthController.ts";

const router = Router();

// routes d'authentification
router.post('/api/auth/register', AuthController.register);
router.post('/api/auth/login', AuthController.login);

export default router;