// 接口定义
import { Hono } from "hono";
import crc32 from "@/utils/crc32.js";

const app = new Hono();

app.onError((err, c) => {
	const msg = `app.onError: ${err.message}`;
	console.error(msg);
	return c.json({ message: msg }, 500);
});

const status = {
	reqcount: 0,
	reqips: {} as Record<string, number>,
	reqpaths: {} as Record<string, number>,
	started: 0,
	uptimems: 0,
};

app.use('*', async (c: any, next) => {
	if (status.started === 0) {
		// 在这里处理状态的初始化
		status.started = Date.now();
	}
	status.uptimems = Date.now() - status.started;
	status.reqcount++;
	const clientIP = c.req.header("CF-Connecting-IP");
	if (!status.reqips[clientIP]) {
		status.reqips[clientIP] = 0;
	}
	status.reqips[clientIP]++;
	if (!status.reqpaths[c.req.path]) {
		status.reqpaths[c.req.path] = 0;
	}
	status.reqpaths[c.req.path]++;
	return await next();
});

app.get("/api/status", async (c) => {
	return c.json({ status });
});

app.route('/api', require('./api').default);

app.route('/', require('@/utils/route/vben').default);

app.get('/', (c) => {
	const clientIP = c.req.header("CF-Connecting-IP");

	return c.text('API: Users list' + clientIP);
});

// Export our Hono app: Hono automatically exports a
// Workers 'fetch' handler for you
export default app;
