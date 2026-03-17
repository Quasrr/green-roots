import { Router } from "express";
import AuthController from "./controllers/AuthController.ts";
import authMiddleware from "./Middlewares/authMiddleware.ts";
import UserController from "./controllers/UserController.ts";
import adminMiddleware from "./Middlewares/adminMiddleware.ts";
const router = Router();

// routes d'authentification
router.post('/api/auth/register', AuthController.register);
router.post('/api/auth/login', AuthController.login);
router.post('/api/auth/logout', authMiddleware, AuthController.logout);
router.get('/api/auth/me', authMiddleware, AuthController.me);

// routes utilisateur
router.get('/api/users', authMiddleware, adminMiddleware, UserController.getAll);
router.get('/api/users/:id', authMiddleware, UserController.getById);
router.patch('/api/users/:id', authMiddleware, UserController.update);
router.delete('/api/users/:id', authMiddleware, UserController.delete);

//routes panier

export default router;