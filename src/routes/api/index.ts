import { Route } from '@/utils/route';
import { ResponseResultData, ResponseMessage } from '@/utils/interface';
import path from 'node:path';
import { createReadStream, existsSync, statSync, writeFileSync } from 'node:fs';

const app = Route();

app.onError((err, c) => {
	if (err instanceof ResponseResultData) {
		console.log('app[/api].onError:', err.resultData);
		return c.json(err.resultData, 500);
	}
	if (err instanceof ResponseMessage) {
		console.log('app[/api].onError:', err.resultData);
		return c.json(err.resultData, 500);
	}
	console.error(`app[/api].onError: ${err.message}`);
	return c.json({ message: { type: 'error', content: err.message } }, 500);
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

async function getSHA1(buffer: ArrayBuffer): Promise<string> {
	const hashBuffer = await crypto.subtle.digest("SHA-1", buffer);
	return Array.from(new Uint8Array(hashBuffer))
		.map(byte => byte.toString(16).padStart(2, '0'))
		.join('');
}
function getFullFileExtension(filename: string): string {
	const index = filename.indexOf('.');
	return index !== -1 ? filename.slice(index) : '';
}
app.post('/upload', async (c) => {
	const formData = await c.req.formData();
	const file = formData.get('file');
	if (!(file instanceof Blob)) {
		return c.json({ error: 'Invalid file upload' }, 400);
	}
	const arrayBuffer = await file.arrayBuffer();
	const file_sha1 = await getSHA1(arrayBuffer);
	const filePath = path.join(path.dirname(__dirname), 'data', file_sha1 + getFullFileExtension(file.name))
	writeFileSync(filePath, Buffer.from(arrayBuffer));
	return c.json({ file_sha1 });
});
app.get('/data/:filename', async (c) => {
	const filePath = path.join(path.dirname(__dirname), 'data', c.req.param('filename'));
	if (!existsSync(filePath)) {
		return c.text('File not found', 404);
	}
	try {
		const fileStat = statSync(filePath);
		const fileStream = createReadStream(filePath);
		c.header('Content-Type', 'application/octet-stream');
		c.header('Content-Disposition', `attachment; filename="${c.req.param('filename')}"`);
		c.header('Content-Length', fileStat.size.toString());
		return new Response(fileStream as any);
	} catch (error) {
		return c.text('Error reading file', 500);
	}
});

app.route('/console', require('./console').default);
app.route('/bee', require('./bee').default);
app.route('/vben', require('./vben').default);
app.route('/avue', require('./avue').default);
app.route('/gjw', require('./gjw').default);
app.route('/bkdata', require('./bkdata').default);

app.get('/', (c) => {
	return c.text('当前是API接口的首页');
});

export default app;
