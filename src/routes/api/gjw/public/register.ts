import { Route } from '@/utils/route';
import { md5 } from '@/utils/crypto';
import { CFD1 } from '@/utils/cfd1';
import { cJson } from '@/utils/vben';

const app = Route();

app.post('/', async (c) => {
	// 通过邮箱注册
	const reqJson = await c.req.json();
	const { username, password } = reqJson;
	const oCFD1 = new CFD1(c.env.DB);
	const oSqlUser = oCFD1
		.sql()
		.select({ id: 'id' })
		.from('pre_system_users')
		.where([['username=?', [username]]])
		.buildSelect();
	// console.log('执行的SQL语句', oSqlUser.getSQL());
	const user = await oCFD1.first(oSqlUser);
	if (user) {
		return cJson(c, { code: -1, type: 'error', message: `您输入的[${username}]已经注册过了，请直接登录或重设密码`, result: null });
	}
	const sqlResult = await oCFD1.all(
		oCFD1
			.sql()
			.from('pre_system_users')
			.set({ created: Date.now(), username, password: await md5(password), status: 1 })
			.buildInsert()
	);
	if (!sqlResult.success) {
		return cJson(c, { code: -1, type: 'error', message: '无法Insert[pre_system_users]', result: null });
	}
	return cJson(c, { code: 0, type: 'success', message: `[${username}]注册成功`, result: null });
});

export default app;
