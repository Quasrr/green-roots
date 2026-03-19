import express from 'express';
import cookieParser from 'cookie-parser';
import router from './src/routes.ts';
import cors from 'cors';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(cookieParser());

// CORS Policy
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://greenroots.duckdns.org'
    ],
    credentials: true
}));

app.use(router);

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});