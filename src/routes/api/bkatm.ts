import { Route } from '../../utils/route';
import { CFD1 } from '../../utils/cfd1';
import { menu_from_list_to_tree } from '../../utils/menu';

export interface ResultData {
	code: number,
	type: 'success' | 'error',
	message: string,
	result: any,
};

function cJson(c: any, data: ResultData) {
	return c.json(data);
}

const app = Route();

app.get('/page-login', (c) => {
	const result = {
		signInTitle: '欢迎使用',
		signInDesc: '后台管理系统',
		login_button_reg: { md: 24, xs: 24 },
	};
	return cJson(c, { code: 0, type: 'success', message: '', result });
});

app.post('/login', (c) => {
	if (0) {
		return cJson(c, { code: -1, type: 'error', message: `用户不存在`, result: {} });
	}
	const result = {
		"roles": [
			{
				"roleName": "Super Admin",
				"value": "super"
			}
		],
		"userId": "1",
		"username": "vben",
		"token": "fakeToken1",
		"realName": "Vben Admin",
		"desc": "manager"
	};
	return cJson(c, { code: 0, type: 'success', message: 'ok', result });
});

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
	const oCFD1 = CFD1(c.env.DB);
	const oSql = oCFD1.sql().from('pre_system_menus').where([["type IN(0,1)", []]]).buildSelect();
	const result = menu_from_list_to_tree((await oCFD1.all(oSql)).results);
	return cJson(c, { code: 0, type: 'success', message: 'ok', result });
});

export default app;
