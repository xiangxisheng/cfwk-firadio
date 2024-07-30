import { Hono } from 'hono';

const app = new Hono();

app.route('/system', require('./system').default);
app.route('/mail', require('./mail').default);

export default app;
