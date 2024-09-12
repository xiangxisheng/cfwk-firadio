import { Route } from '@/utils/route';
import { md5 } from '@/utils/crypto';
import { CFD1 } from '@/utils/cfd1';
import { cJson, ResponseData, ResponseMessage } from '@/utils/vben';

const app = Route();

app.post('/', async (c) => {
	const reqJson = await c.req.json();
	const { username, password } = reqJson;
	const oCFD1 = new CFD1(c.env.DB);
	const select = {
		id: 'id',
		login_name: 'login_name',
		login_password: 'login_password',
		status: 'status',
	};
	const oSqlUser = oCFD1
		.sql()
		.select(select)
		.from('pre_system_users')
		.where([['login_name=?', [username]]])
		.buildSelect();
	console.log('执行的SQL语句', oSqlUser.getSQL());
	const user = await oCFD1.first(oSqlUser);
	if (!user) {
		return cJson(c, { code: -1, type: 'error', message: `您输入的[${username}]不存在`, result: null });
	}
	if (user['login_password'] !== (await md5(password))) {
		return cJson(c, { code: -1, type: 'error', message: `密码错误`, result: null });
	}
	if (user['status'] === 2) {
		return cJson(c, { code: -1, type: 'error', message: '用户已被冻结', result: null });
	}
	if (user['status'] !== 1) {
		return cJson(c, { code: -1, type: 'error', message: '用户状态异常', result: null });
	}
	const user_id = Number(user['id']);
	const token = crypto.randomUUID();
	const insert = {
		created: Date.now(),
		logged: Date.now(),
		token: await md5(token),
		user_id,
		status: 1,
	};
	const sqlResult = await oCFD1.all(oCFD1.sql().from('pre_system_sessions').set(insert).buildInsert());
	if (!sqlResult.success) {
		return cJson(c, { code: -1, type: 'error', message: '无法处理pre_system_sessions', result: null });
	}
	const sqlUpdateUserResult = await oCFD1.all(
		oCFD1
			.sql()
			.from('pre_system_users')
			.where([['id=?', [user_id]]])
			.set({ logged: Date.now() })
			.buildUpdate()
	);
	if (!sqlUpdateUserResult.success) {
		return cJson(c, { code: -1, type: 'error', message: '[pre_system_users]更新失败', result: null });
	}
	const result = {
		roles: [
			{
				roleName: 'Super Admin',
				value: 'super',
			},
		],
		userId: user['id'],
		username: user['login_name'],
		token: token,
		realName: 'Vben Admin',
		desc: 'manager',
	};
	return cJson(c, { code: 0, type: 'success', message: 'ok', result });
});

export default app;
