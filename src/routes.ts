// 接口定义
import { Env } from './utils/interface';
import { Hono } from "hono";
import crc32 from "./utils/crc32.js";

const app = new Hono<{ Bindings: Env }>();

app.route('/api', require('./routes/api').default);

app.get('/', (c) => {
	const clientIP = c.req.header("CF-Connecting-IP");

	return c.text('API: Users list' + clientIP);
});

// Export our Hono app: Hono automatically exports a
// Workers 'fetch' handler for you
export default app;
