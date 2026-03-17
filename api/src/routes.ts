import { Router } from "express";
import AuthController from "./controllers/AuthController.ts";
import authMiddleware from "./Middlewares/authMiddleware.ts";
const router = Router();

// routes d'authentification
router.post('/api/auth/register', AuthController.register);
router.post('/api/auth/login', AuthController.login);
router.post('/api/auth/logout', authMiddleware, AuthController.logout);
router.get('/api/auth/me', authMiddleware, AuthController.me);

export default router;