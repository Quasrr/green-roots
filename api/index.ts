import express from 'express';
import router from './src/routes.ts';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

app.use(router);

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});