import express from 'express';
import { errorHandler } from './middlewares/error-handler';
import { requestId } from './middlewares/request-id';
import { sessaoRouter } from './sessao/routes';
import { usuarioRouter } from './usuario/routes';

export const app = express();

app.use(express.json());
app.use(requestId);

app.use('/v1/sessoes', sessaoRouter);
app.use('/v1/usuarios', usuarioRouter);
// Demais domínios de negócio registram suas rotas aqui conforme nascem (cliente).

app.use(errorHandler);
