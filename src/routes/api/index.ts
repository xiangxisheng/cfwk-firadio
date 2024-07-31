import { Hono } from 'hono';
import { ResponseResultData, ResponseMessage } from '../../utils/interface';

const app = new Hono();

app.onError((err, c) => {
	if (err instanceof ResponseResultData) {
		console.log('app[/api].onError:', err.resultData);
		return c.json(err.resultData);
	}
	if (err instanceof ResponseMessage) {
		console.log('app[/api].onError:', err.resultData);
		return c.json(err.resultData);
	}
	console.error(`app[/api].onError: ${err.message}`);
	return c.json({ message: { type: "error", content: err.message } });
});

// 跨域中间件
app.use('*', async (c: any, next) => {
	const origin = c.req.header('Origin');
	if (origin) {
		c.res.headers.set('Access-Control-Allow-Origin', origin);
	}
	const requestMethod = c.req.header('Access-Control-Request-Method');
	if (requestMethod) {
		c.res.headers.set('Access-Control-Allow-Methods', requestMethod);
	}
	const requestHeaders = c.req.header('Access-Control-Request-Headers');
	if (requestHeaders) {
		c.res.headers.set('Access-Control-Allow-Headers', requestHeaders);
	}
	// 如果是预检请求，直接返回204响应
	if (c.req.method === 'OPTIONS') {
		return c.text(null, 204);
	}
	return await next();
});

app.route('/console', require('./console').default);

app.get('/', (c) => {
	return c.text('当前是API接口的首页');
});

export default app;
