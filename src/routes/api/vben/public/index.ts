import { Route } from '@/utils/route';
import { cJson, ResponseData, ResponseMessage } from '@/utils/vben';

const app = Route();

app.get('/page-login', (c) => {
	const result = {
		signInTitle: '欢迎使用',
		signInDesc: '后台管理系统',
		login_button_reg: { md: 24, xs: 24 },
	};
	return cJson(c, { code: 0, type: 'success', message: '', result });
});

app.route('/email', require('./email').default);
app.route('/login', require('./login').default);

export default app;
