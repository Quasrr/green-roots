import { Router } from "express";
import AuthController from "./controllers/AuthController.ts";
import authMiddleware from "./Middlewares/authMiddleware.ts";
import TreesController from "./controllers/TreesController.ts";
const router = Router();

// routes d'authentification
router.post('/api/auth/register', AuthController.register);
router.post('/api/auth/login', AuthController.login);
router.post('/api/auth/logout', authMiddleware, AuthController.logout);
router.get('/api/auth/me', authMiddleware, AuthController.me);

// routes d'arbres
router.get('/api/trees', TreesController.getAll);
router.get('/api/trees/:id', TreesController.getById);
router.post('/api/trees', TreesController.create);
router.patch('/api/trees/:id', TreesController.update);
router.delete('/api/trees/:id', TreesController.delete);

export default router;