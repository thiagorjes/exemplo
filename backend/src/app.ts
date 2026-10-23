import express from 'express';
import { errorHandler } from './middlewares/error-handler';
import { requestId } from './middlewares/request-id';

export const app = express();

app.use(express.json());
app.use(requestId);

// Domínios de negócio registram suas rotas aqui conforme nascem (sessao, usuario, cliente).

app.use(errorHandler);
