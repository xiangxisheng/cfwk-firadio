import { Route } from '@/utils/route';
import { Config } from '@/utils/config';
import { md5 } from '@/utils/crypto';
import { CFD1 } from '@/utils/cfd1';
import { cJson, ResponseResultData, ResponseMessage } from '@/utils/vben';
import { menu_from_list_to_tree } from '@/utils/menu';
import { generateRandom } from '@/utils/string';

const app = Route();

app.onError((err, c) => {
	if (err instanceof ResponseResultData) {
		console.log(`app.onError:`, err.resultData);
		return c.json(err.resultData);
	}
	if (err instanceof ResponseMessage) {
		console.log(`app.onError:`, err.resultData);
		return c.json(err.resultData);
	}
	console.error(`app.onError: ${err.message}`);
	return cJson(c, { code: -1, type: 'error', message: err.message, result: null });
});

app.use('*', async (c, next) => {
	const oCFD1 = new CFD1(c.env.DB);
	const config = new Config({
		async get(name: string): Promise<Record<string, string | number>> {
			const select = {
				'value': 'value',
			};
			const oSqlConfig = oCFD1.sql().select(select).from('pre_system_configs').where([["name=?", [name]]]).buildSelect();
			//console.log('执行的SQL语句', oCFD1.getSQL(oSqlConfig));
			const rConfig = await oCFD1.first(oSqlConfig);
			if (rConfig === null) {
				return {};
			}
			return JSON.parse(rConfig['value'] as string) as Record<string, string | number>;
		},
		async save(name: string, data: Record<string, string | number>) {
			console.log('save', name, JSON.stringify(data));
			const oSqlConfig = oCFD1.sql().from('pre_system_configs').buildUpsert({ name }, { value: JSON.stringify(data) });
			console.log('执行的SQL语句', oCFD1.getSQL(oSqlConfig));
			const sqlResult = await oCFD1.all(oSqlConfig);
			if (!sqlResult.success) {
				console.log('sqlResult', sqlResult);
			}
		}
	});
	c.set('config', config);
	return await next();
});

app.get('/page-login', (c) => {
	const result = {
		signInTitle: '欢迎使用',
		signInDesc: '后台管理系统',
		login_button_reg: { md: 24, xs: 24 },
	};
	return cJson(c, { code: 0, type: 'success', message: '', result });
});

const cache = {
	otp: '',
};

app.post('/email-otp', async (c) => {
	// 发送邮箱验证码
	const reqJson = await c.req.json();
	const { email } = reqJson;
	cache.otp = generateRandom(6, '0123456789');
	// 验证码已发送至您的邮箱
	const config_email = await c.get('config').email.data();
	//config_email.api_type.value = 123123;
	console.log('api_type', config_email.api_type.value);
	//await c.get('config').email.save();
	return cJson(c, { code: 0, type: 'success', message: `您的验证码是:${cache.otp}`, result: null });
});

app.post('/email-register', async (c) => {
	// 通过邮箱注册
	const reqJson = await c.req.json();
	const { email } = reqJson;
});

app.post('/email-resetpwd', async (c) => {
	// 发送邮箱重置密码
	const reqJson = await c.req.json();
	const { email } = reqJson;
	cache.otp = generateRandom(6, '0123456789');
});

app.post('/login', async (c) => {
	const reqJson = await c.req.json();
	const { username, password } = reqJson;
	const oCFD1 = new CFD1(c.env.DB);
	const select = {
		'id': 'id',
		'login_name': 'login_name',
		'login_password': 'login_password',
		'status': 'status',
	};
	const oSqlUser = oCFD1.sql().select(select).from('pre_system_users').where([["login_name=?", [username]]]).buildSelect();
	console.log('执行的SQL语句', oCFD1.getSQL(oSqlUser));
	const user = await oCFD1.first(oSqlUser);
	if (!user) {
		return cJson(c, { code: -1, type: 'error', message: `您输入的[${username}]不存在`, result: null });
	}
	if (user['login_password'] !== await md5(password)) {
		return cJson(c, { code: -1, type: 'error', message: `密码错误`, result: null });
	}
	if (user['status'] === 2) {
		return cJson(c, { code: -1, type: 'error', message: '用户已被冻结', result: null });
	}
	if (user['status'] !== 1) {
		return cJson(c, { code: -1, type: 'error', message: '用户状态异常', result: null });
	}
	const token = crypto.randomUUID();
	const insert = {
		'created': Date.now(),
		'logged': Date.now(),
		'token': await md5(token),
		'user_id': Number(user['id']),
		'status': 1,
	};
	const sqlResult = await oCFD1.all(oCFD1.sql().from('pre_system_sessions').buildInsert(insert));
	if (!sqlResult.success) {
		return cJson(c, { code: -1, type: 'error', message: '无法处理pre_system_sessions', result: null });
	}
	const result = {
		"roles": [
			{
				"roleName": "Super Admin",
				"value": "super"
			}
		],
		"userId": user['id'],
		"username": user['login_name'],
		"token": token,
		"realName": "Vben Admin",
		"desc": "manager"
	};
	return cJson(c, { code: 0, type: 'success', message: 'ok', result });
});

// 以下代码都要校验登录会话
app.use('*', async (c, next) => {
	const authorization = c.req.header("authorization");
	if (!authorization) {
		return cJson(c, { code: 401, type: 'error', message: '请先登录', result: null });
	}
	const oCFD1 = new CFD1(c.env.DB);
	const select = {
		'user_id': 'user_id',
		'status': 'status',
	};
	const token = await md5(authorization);
	const oSqlSession = oCFD1.sql().select(select).from('pre_system_sessions').where([["token=?", [token]]]).buildSelect();
	console.log('执行的SQL语句', oCFD1.getSQL(oSqlSession));
	const session = await oCFD1.first(oSqlSession);
	if (!session) {
		return cJson(c, { code: 401, type: 'error', message: '会话失效', result: null });
	}
	if (session['status'] === 2) {
		return cJson(c, { code: 401, type: 'error', message: '用户已退出登录', result: null });
	}
	if (session['status'] !== 1) {
		return cJson(c, { code: 401, type: 'error', message: '会话状态异常', result: null });
	}
	const selectUser = {
		'login_name': 'login_name',
		'status': 'status',
		'roles': 'roles',
	};
	const oSqlUser = oCFD1.sql().select(selectUser).from('pre_system_users').where([["id=?", [session['user_id']]]]).buildSelect();
	console.log('执行的SQL语句', oCFD1.getSQL(oSqlUser));
	const user = await oCFD1.first(oSqlUser);
	if (!user) {
		return cJson(c, { code: 401, type: 'error', message: '用户不存在', result: null });
	}
	if (user['status'] === 2) {
		return cJson(c, { code: 401, type: 'error', message: '用户已被冻结', result: null });
	}
	if (user['status'] !== 1) {
		return cJson(c, { code: 401, type: 'error', message: '用户状态异常', result: null });
	}
	c.set("user", user);
	return await next();
});

app.route('/system', require('./system').default);

app.get('/logout', (c) => {
	return cJson(c, { code: 0, type: 'success', message: 'Token has been destroyed', result: null });
});

app.get('/getUserInfo', (c) => {
	const result = {
		"userId": "1",
		"username": "bkatm",
		"realName": "Bkatm Admin",
		"avatar": "",
		"desc": "manager",
		"homePath": "/dashboard/analysis",
		"roles": [
			{
				"roleName": "超级管理员",
				"value": "super"
			}
		]
	};
	return cJson(c, { code: 0, type: 'success', message: 'ok', result });
});


app.get('/getPermCode', (c) => {
	const result = ["1000", "3000", "5000"];
	return cJson(c, { code: 0, type: 'success', message: 'ok', result });
});

app.get('/getMenuList', async (c) => {
	const oCFD1 = new CFD1(c.env.DB);
	const select = {
		'id': 'id',
		'parent_id': 'parent_id',
		'name': 'name',
		'title': 'title',
		'path': 'path',
		'icon': 'icon',
		'component': 'component',
		'redirect': 'redirect',
		'meta': 'meta',
	};
	const oSql = oCFD1.sql().select(select).from('pre_system_menus').where([["type IN(0,1)", []]]).orderBy(['orderNo']).buildSelect();
	const results = (await oCFD1.all(oSql)).results;
	for (const mRow of results) {
		const meta: Record<string, unknown> = typeof mRow['meta'] === 'string' ? JSON.parse(mRow['meta']) : {};
		meta['icon'] = mRow['icon'];
		meta['title'] = mRow['title'];
		mRow['meta'] = meta;
	}
	return cJson(c, { code: 0, type: 'success', message: 'ok', result: menu_from_list_to_tree(results) });
});

export default app;
