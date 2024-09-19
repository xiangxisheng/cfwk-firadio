import { Route } from '@/utils/route';

const app = Route();
app.route('/customer', require('./customer').default);

export default app;
