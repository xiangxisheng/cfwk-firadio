import { Route } from '@/utils/route';

const app = Route();

app.route('/system', require('./system').default);
app.route('/mail', require('./mail').default);

export default app;
