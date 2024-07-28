import { Hono } from 'hono';
import { Env } from '../../../utils/interface';
import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'

const app = new Hono<{ Bindings: Env }>();

app.route('/system', require('./system').default);
app.route('/mail', require('./mail').default);

export default app;
