import { Hono } from 'hono';
import { Env } from '../../../../utils/interface';
import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'

const app = new Hono<{ Bindings: Env }>();

app.route('/users', require('./users').default);

export default app;
