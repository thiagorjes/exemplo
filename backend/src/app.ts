import express from 'express';
import { errorHandler } from './middlewares/error-handler';
import { requestId } from './middlewares/request-id';
import { sessaoRouter } from './sessao/routes';

export const app = express();

app.use(express.json());
app.use(requestId);

app.use('/v1/sessoes', sessaoRouter);
// Demais domínios de negócio registram suas rotas aqui conforme nascem (usuario, cliente).

app.use(errorHandler);
