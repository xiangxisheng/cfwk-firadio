import { Route } from '@/utils/route';

const app = Route();

app.route('/users', require('./users').default);

export default app;
