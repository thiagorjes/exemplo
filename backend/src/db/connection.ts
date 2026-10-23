import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { config } from '../config';

mkdirSync(dirname(config.DATABASE_PATH), { recursive: true });

// Conexão única, reusada por todos os repositories — sem pool (decisão registrada em
// governance/guidelines/backend/node/architecture.md §4: SQLite é um arquivo único, não há
// benefício em várias conexões de escrita concorrente nesta escala de demo).
export const db = new DatabaseSync(config.DATABASE_PATH);
