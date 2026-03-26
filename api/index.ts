import express from 'express';
import type { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import router from './src/routes.ts';
import { doubleCsrf } from 'csrf-csrf';
import cors from 'cors';
import helmet from 'helmet';
import { apiLimiter } from './src/Middlewares/rateLimitMiddleware.ts';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Obligatoire car en prod on est derrière un reverse proxy, express ne verrait que l'ip de celui ci sans cette option
// Ajoute les en-têtes X-Forwared-* pour reconstituer la vraie ip client
app.set('trust proxy', 1);

app.use(express.json());
app.use(helmet());
app.use(cookieParser());

// CORS Policy
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://greenroots.duckdns.org'
    ],
    credentials: true
}));

// Créer la fontion de génération du token + middleware
const { generateToken, doubleCsrfProtection } = doubleCsrf({
    getSecret: () => process.env.JWT_SECRET as string,
    cookieName: 'csrfToken',
    cookieOptions: {
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
    }
});

app.use('/api', apiLimiter);

// CSRF getter
app.get('/api/csrf', (req: Request, res: Response) => {
    const csrfToken = generateToken(req, res);
    res.send({ csrfToken });
});

// CSRF Middleware
app.use(doubleCsrfProtection);

app.use(router);

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});