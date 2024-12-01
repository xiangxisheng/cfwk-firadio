import { Route } from '@/utils/route';

const app = Route();

app.route('/system', require('./system').default);
app.route('/mail', require('./mail').default);
app.route('/aliyun', require('./aliyun').default);

export default app;
