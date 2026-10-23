import express from 'express';
import { errorHandler } from './middlewares/error-handler';
import { requestId } from './middlewares/request-id';
import { sessaoRouter } from './sessao/routes';
import { usuarioRouter } from './usuario/routes';
import { clienteRouter } from './cliente/routes';

export const app = express();

app.use(express.json());
app.use(requestId);

app.use('/v1/sessoes', sessaoRouter);
app.use('/v1/usuarios', usuarioRouter);
app.use('/v1/clientes', clienteRouter);

app.use(errorHandler);
