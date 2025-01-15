import { Route } from '@/utils/route';
const app = Route();

app.route('/columns', require('./columns').default);

app.get('/', async (c, next) => {
    return c.json({});
});

export default app;
