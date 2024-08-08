import { Route } from '../../utils/route';

export interface ResultData {
	code: 0,
	type: 'success',
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
	const result = {

	};
	return cJson(c, { code: 0, type: 'success', message: '登录成功', result });
});

export default app;
