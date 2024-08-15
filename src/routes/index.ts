// 接口定义
import { Route } from '@/utils/route';
import crc32 from '@/utils/crc32.js';
import { Config } from '@/utils/config';
import { ISettingValue } from '@/utils/config/base';
import { CFD1 } from '@/utils/cfd1';

const app = Route();

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

const config_cache: Record<string, Record<string, ISettingValue>> = {};

app.use('*', async (c, next) => {
	const oCFD1 = new CFD1(c.env.DB);
	const config = new Config({
		async get(name: string): Promise<Record<string, ISettingValue>> {
			if (config_cache[name]) {
				return config_cache[name];
			}
			const select = {
				value: 'value',
			};
			const oSqlConfig = oCFD1
				.sql()
				.select(select)
				.from('pre_system_configs')
				.where([['name=?', [name]]])
				.buildSelect();
			//console.log('执行的SQL语句', oCFD1.getSQL(oSqlConfig));
			const rConfig = await oCFD1.first(oSqlConfig);
			if (rConfig === null) {
				return {};
			}
			config_cache[name] = JSON.parse(rConfig['value'] as string) as Record<string, ISettingValue>;
			return config_cache[name];
		},
		async save(name: string, data: Record<string, ISettingValue>) {
			const jData = JSON.stringify(data);
			console.log('save', name, jData);
			const oSqlConfig = oCFD1.sql().from('pre_system_configs').buildUpsert({ name }, { value: jData });
			console.log('执行的SQL语句', oCFD1.getSQL(oSqlConfig));
			const sqlResult = await oCFD1.all(oSqlConfig);
			if (!sqlResult.success) {
				console.log('sqlResult', sqlResult);
			}
			config_cache[name] = data;
		},
	});
	c.set('configs', config.configs);
	return await next();
});

app.use('*', async (c: any, next) => {
	if (status.started === 0) {
		// 在这里处理状态的初始化
		status.started = Date.now();
	}
	status.uptimems = Date.now() - status.started;
	status.reqcount++;
	const clientIP = c.req.header('CF-Connecting-IP');
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

app.get('/api/status', async (c) => {
	return c.json({ status });
});

app.route('/api', require('./api').default);

app.route('/', require('@/utils/route/vben').default);

app.get('/', (c) => {
	const clientIP = c.req.header('CF-Connecting-IP');

	return c.text('API: Users list' + clientIP);
});

// Export our Hono app: Hono automatically exports a
// Workers 'fetch' handler for you
export default app;
