import { Route } from '@/utils/route';
import { md5 } from '@/utils/crypto';
import { CFD1 } from '@/utils/cfd1';
import { cJson, ResponseData, ResponseMessage } from '@/utils/vben';

const app = Route();

// 以下代码都要校验登录会话
app.use('*', async (c, next) => {
	const authorization = c.req.header('authorization');
	if (!authorization) {
		return cJson(c, { code: 401, type: 'error', message: '请先登录', result: null });
	}
	const oCFD1 = new CFD1(c.env.DB);
	const select = {
		user_id: 'user_id',
		status: 'status',
	};
	const token = await md5(authorization);
	const oSqlSession = oCFD1
		.sql()
		.select(select)
		.from('pre_system_sessions')
		.where([['token=?', [token]]])
		.buildSelect();
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
		login_name: 'login_name',
		status: 'status',
		roles: 'roles',
	};
	const oSqlUser = oCFD1
		.sql()
		.select(selectUser)
		.from('pre_system_users')
		.where([['id=?', [session['user_id']]]])
		.buildSelect();
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
	c.set('user', user);
	return await next();
});

app.route('/auth', require('./auth').default);
app.route('/bkatm', require('./bkatm').default);
app.route('/system', require('./system').default);

export default app;
