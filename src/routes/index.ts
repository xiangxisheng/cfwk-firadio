// 接口定义
import { Route } from '@/utils/route';
import crc32 from '@/utils/crc32.js';
import { Config } from '@/utils/config';
import { ISettingValue } from '@/utils/config/base';
import { CFD1 } from '@/utils/cfd1';
import { getPartsOfDomain, getPartsOfPathname } from '@/utils/common';
import renderHtml from '@/utils/renderHtml';

const app = Route();

app.onError((err, c) => {
	const msg = `app.onError(/): ${err.message}`;
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
	// 下面是加载系统配置
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
			//console.log('执行的SQL语句', oSqlConfig.getSQL());
			const rConfig = await oCFD1.first(oSqlConfig);
			if (!rConfig) {
				return {};
			}
			config_cache[name] = JSON.parse(rConfig['value'] as string) as Record<string, ISettingValue>;
			return config_cache[name];
		},
		async save(name: string, data: Record<string, ISettingValue>) {
			const jData = JSON.stringify(data);
			console.log('save', name, jData);
			const oSqlConfig = oCFD1.sql().from('pre_system_configs').conflict({ name }).set({ value: jData }).buildUpsert();
			console.log('执行的SQL语句', oSqlConfig.getSQL());
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

app.get('*', async (c, next) => {
	// 获取短链接的配置
	// 1: 解析URL
	const oUrl = new URL(c.req.url);
	const aSubDomain = getPartsOfDomain(oUrl.hostname);
	// 2: 顶级域名自动跳转到www
	if (aSubDomain.length === 2) {
		// 顶级域名要跳转到带www的二级域名
		if (oUrl.pathname === '/') {
			return Response.redirect(`${oUrl.protocol}//www.${aSubDomain[1]}.${aSubDomain[0]}`);
		}
	}
	const aLinkName = getPartsOfPathname(oUrl.pathname);
	if (aLinkName.length !== 1) {
		// 跳过，因为短链接没有二级目录
		return await next();
	}
	const sRootLinkName = aLinkName[0];
	if (!/^[0-9A-Za-z_-]+$/.test(sRootLinkName)) {
		// 跳过，如果不符合短链接的名称规则
		return await next();
	}
	const oCFD1 = new CFD1(c.env.DB);
	const oSqlLinks = oCFD1
		.sql()
		.select({
			title: 'title',
			url: 'url',
		})
		.from('links')
		.where([['name=?', [sRootLinkName]]])
		.buildSelect();
	const rLink = await oCFD1.first(oSqlLinks);
	if (!rLink) {
		// 没有查到短链接
		return await next();
	}
	// 找到对应的链接名称
	const clientIP = c.req.header('CF-Connecting-IP');
	const sUserIpCrc32 = clientIP ? crc32(clientIP).toString(16) : '';
	if (aSubDomain.length === 2) {
		// 如果访问了顶级域名，就跳转至带IP验证的二级域名
		return Response.redirect(`${oUrl.protocol}//${sUserIpCrc32}.${aSubDomain[1]}.${aSubDomain[0]}${oUrl.pathname}`);
	}
	if (sUserIpCrc32 !== aSubDomain[2]) {
		return c.html('该链接不存在或已失效', 404);
	}
	return c.html(renderHtml({ title: rLink['title']?.toString() ?? '', url: rLink['url']?.toString() ?? '' }));
});

app.route('/', require('@/utils/route/vben').default);

app.get('/', (c) => {
	const clientIP = c.req.header('CF-Connecting-IP');

	return c.text('API: Users list' + clientIP);
});

// Export our Hono app: Hono automatically exports a
// Workers 'fetch' handler for you
export default app;
