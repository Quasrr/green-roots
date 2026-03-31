import { Router } from "express";
import AuthController from "./controllers/AuthController.ts";
import authMiddleware from "./Middlewares/authMiddleware.ts";
import UserController from "./controllers/UserController.ts";
import TreesController from "./controllers/TreesController.ts";
import OrdersController from "./controllers/OrdersController.ts";
import adminMiddleware from "./Middlewares/adminMiddleware.ts";
import CartController from "./controllers/CartController.ts";
import { loginLimiter } from "./Middlewares/rateLimitMiddleware.ts";

const router = Router();

// routes d'authentification
router.post('/api/auth/register', loginLimiter, AuthController.register);
router.post('/api/auth/login', loginLimiter, AuthController.login);
router.post('/api/auth/logout', authMiddleware, AuthController.logout);
router.get('/api/auth/me', authMiddleware, AuthController.me);
// Renouvellement de l'access token via le refresh token 
// (pas de authMiddleware car l'access token est expiré à ce moment-là)
router.post('/api/auth/refresh', loginLimiter, AuthController.refreshAccessToken);

// routes utilisateur
router.get('/api/users', authMiddleware, adminMiddleware, UserController.getAll);
router.get('/api/users/:id', authMiddleware, UserController.getById);
router.patch('/api/users/:id', authMiddleware, UserController.update);
router.delete('/api/users/:id', authMiddleware, UserController.delete);

//routes panier
router.get('/api/cart', authMiddleware, CartController.getAll);
router.put('/api/cart', authMiddleware, CartController.update);

// routes d'arbres
router.get('/api/trees', TreesController.getAll);
router.get('/api/trees/:id', TreesController.getById);
router.post('/api/trees', authMiddleware, adminMiddleware, TreesController.create);
router.patch('/api/trees/:id', authMiddleware, adminMiddleware, TreesController.update);
router.delete('/api/trees/:id', authMiddleware, adminMiddleware, TreesController.delete);

// routes Commandes
router.get('/api/orders', authMiddleware, adminMiddleware, OrdersController.getOrders);
router.post('/api/orders', authMiddleware, OrdersController.createOrder);
router.post('/api/orders/:id/pay', authMiddleware, OrdersController.payOrder);
router.patch('/api/orders/:id/cancel', authMiddleware, OrdersController.cancelOrder);
router.get('/api/orders/me', authMiddleware, OrdersController.getMyOrders);
router.get('/api/orders/me/:id', authMiddleware, OrdersController.getOrderById);

export default router;