import { Route } from '@/utils/route';
const app = Route();

app.route('/data', require('./data').default);

app.get('/', async (c, next) => {
    return c.json({});
});

export default app;
