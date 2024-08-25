import { Route } from '@/utils/route';
import { md5 } from '@/utils/crypto';
import { CFD1 } from '@/utils/cfd1';
import { cJson, ResponseData, ResponseMessage } from '@/utils/vben';
import { OtpAuth } from '@/utils/otp_auth';
import { MailApi } from '@/utils/mail_api';

const app = Route();

const otpAuth = new OtpAuth();

app.post('/otp', async (c) => {
	// 发送邮箱验证码
	const reqJson = await c.req.json();
	const { email, action } = reqJson;
	if (typeof email !== 'string' || email.length === 0) {
		return cJson(c, { code: -1, type: 'error', message: '请输入E-Mail邮箱', result: null });
	}
	const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
	const validateEmail = (email: string): boolean => emailRegex.test(email);
	if (!validateEmail(email)) {
		return cJson(c, { code: -1, type: 'error', message: '您输入的E-Mail邮箱格式不正确', result: null });
	}
	const oCFD1 = new CFD1(c.env.DB);
	const oSqlUser = oCFD1
		.sql()
		.select({ id: 'id' })
		.from('pre_system_users')
		.where([['login_name=?', [email]]])
		.buildSelect();
	console.log('执行的SQL语句', oCFD1.getSQL(oSqlUser));
	const user = await oCFD1.first(oSqlUser);
	switch (action) {
		case 'register':
			if (user) {
				return cJson(c, { code: -1, type: 'error', message: `您输入的[${email}]已经注册过了，请直接登录或重设密码`, result: null });
			}
			break;
		case 'resetpwd':
			if (!user) {
				return cJson(c, { code: -1, type: 'error', message: `您输入的[${email}]尚未注册`, result: null });
			}
			break;
		default:
			return cJson(c, { code: -1, type: 'error', message: `未知的action=>[${action}]`, result: null });
	}
	/*
	const config_email = await c.get('configs').email.data();
	console.log('api_type', config_email.api_type.value);
	//config_email.api_type.value = 'mailersend';
	await c.get('configs').email.save();
	//*/
	const code = otpAuth.getNew(email);
	const mailApi = new MailApi(await c.get('configs').email.data());
	mailApi.setRecipient(email);
	mailApi.setSubject(`您的验证码是:${code}`);
	mailApi.setTextPlain(`您的验证码是:${code}`);
	await mailApi.send();
	//return cJson(c, { code: 0, type: 'success', message: `您的验证码是:${code}`, result: null });
	return cJson(c, { code: 0, type: 'success', message: `验证码已发送至您的邮箱`, result: null });
});

app.post('/register', async (c) => {
	// 通过邮箱注册
	const reqJson = await c.req.json();
	const { email, otp_code, password } = reqJson;
	otpAuth.verify(email, otp_code);
	const oCFD1 = new CFD1(c.env.DB);
	const oSqlUser = oCFD1
		.sql()
		.select({ id: 'id' })
		.from('pre_system_users')
		.where([['login_name=?', [email]]])
		.buildSelect();
	console.log('执行的SQL语句', oCFD1.getSQL(oSqlUser));
	const user = await oCFD1.first(oSqlUser);
	if (user) {
		return cJson(c, { code: -1, type: 'error', message: `您输入的[${email}]已经注册过了，请直接登录或重设密码`, result: null });
	}
	const sqlResult = await oCFD1.all(
		oCFD1
			.sql()
			.from('pre_system_users')
			.set({ created: Date.now(), login_name: email, login_password: await md5(password), status: 1 })
			.buildInsert()
	);
	if (!sqlResult.success) {
		return cJson(c, { code: -1, type: 'error', message: '无法Insert[pre_system_users]', result: null });
	}
	return cJson(c, { code: 0, type: 'success', message: `[${email}]注册成功`, result: null });
});

app.post('/resetpwd', async (c) => {
	// 发送邮箱重置密码
	const reqJson = await c.req.json();
	const { email, otp_code, password } = reqJson;
	otpAuth.verify(email, otp_code);
	const oCFD1 = new CFD1(c.env.DB);
	const oSqlUser = oCFD1
		.sql()
		.select({ id: 'id' })
		.from('pre_system_users')
		.where([['login_name=?', [email]]])
		.buildSelect();
	console.log('执行的SQL语句', oCFD1.getSQL(oSqlUser));
	const user = await oCFD1.first(oSqlUser);
	if (!user) {
		return cJson(c, { code: -1, type: 'error', message: `您输入的[${email}]尚未注册`, result: null });
	}
	const sqlResult = await oCFD1.all(
		oCFD1
			.sql()
			.from('pre_system_users')
			.where([['id=?', [user.id]]])
			.set({ updated: Date.now(), login_password: await md5(password) })
			.buildUpdate()
	);
	if (!sqlResult.success) {
		return cJson(c, { code: -1, type: 'error', message: '无法Update[pre_system_users]', result: null });
	}
	return cJson(c, { code: 0, type: 'success', message: `[${email}]密码已重设`, result: null });
});

export default app;
