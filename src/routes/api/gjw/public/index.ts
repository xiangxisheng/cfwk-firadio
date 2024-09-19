import { Route } from '@/utils/route';

const app = Route();

app.route('/login', require('./login').default);
app.route('/register', require('./register').default);

export default app;
