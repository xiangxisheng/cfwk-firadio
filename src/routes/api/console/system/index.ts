import { Hono } from 'hono';

const app = new Hono();

app.route('/users', require('./users').default);

export default app;
