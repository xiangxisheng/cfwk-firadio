import { Route } from '@/utils/route';

const app = Route();

app.route('/bankcard', require('./bankcard').default);

export default app;
