// 接口定义
import { Hono } from "hono";
import crc32 from "@/utils/crc32.js";

const app = new Hono();

app.onError((err, c) => {
	const msg = `app.onError: ${err.message}`;
	console.error(msg);
	return c.json({ message: msg }, 500);
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
