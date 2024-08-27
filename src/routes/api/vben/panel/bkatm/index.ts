import { Route } from '@/utils/route';

const app = Route();

app.route('/bankcard', require('./bankcard').default);
app.route('/mail', require('./mail').default);

export default app;
