import express from 'express';
import type { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import router from './src/routes.ts';
import { doubleCsrf } from 'csrf-csrf';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

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
