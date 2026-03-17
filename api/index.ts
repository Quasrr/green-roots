import express from 'express';
import cookieParser from 'cookie-parser';
import router from './src/routes.ts';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(cookieParser());





app.use(router);

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});