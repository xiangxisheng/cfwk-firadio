import { Route } from '@/utils/route';
import { CFD1 } from '@/utils/cfd1';
import { SendEmail } from '@/utils/mail';

const app = Route();

app.get("/send", async (c) => {
	const mail = new SendEmail(c.env);
	mail.setSender("notice@email-all.com", "邮件通知");
	mail.setRecipient("wolerba@gmail.com");
	mail.addTextPlain("邮件主题", "邮件内容");
	await mail.send();
	return c.json({ message: '邮件发送成功' });
});

app.get("/send2", async (c) => {

	// 准备要发送的 JSON 数据
	const jsonData = {
		"from": {
			"email": "MS_AsXkbp@firadio.com",
			"name": "验证码"
		},
		"to": [
			{
				"email": "firadio@me.com",
			}
		],
		"subject": "您的验证码是123456",
		"text": "您的验证码是123456",
	};

	// 使用 fetch 发送 JSON 数据到目标 API
	const response = await fetch('https://api.mailersend.com/v1/email', {
		method: 'POST',
		headers: {
			'Authorization': `Bearer mlsn.834af18f0e02b3dc01bac6ba8f554d032a8390a00d66de0d1e53b5b21592b9c2`, // 如果需要身份验证
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(jsonData),
	});
	if (response.status === 202) {
		return c.json({ message: '邮件发送成功' });
	}
	return c.json({ message: '邮件发送成功', error: await response.text() });
});

app.get("/", async (c) => {
	const oCFD1 = new CFD1(c.env.DB);
	const select = {
		'id': 'id',
		'created': 'created',
		'email_from': 'email_from',
		'email_to': 'email_to',
		'subject': 'subject',
	};
	const oSql = oCFD1.sql();
	oSql.select(select);
	oSql.from('mails');
	oSql.orderBy(['id DESC']);
	oSql.offset(Number(c.req.query('offset') || 0));
	oSql.limit(Number(c.req.query('limit') || 10));
	oSql.buildSelect();
	console.log('执行的SQL语句', oCFD1.getSQL(oSql));
	return c.json((await oCFD1.all(oSql)).results);
});

app.get("/:id", async (c) => {
	const oCFD1 = new CFD1(c.env.DB);
	const id = Number(c.req.param("id"));
	if (isNaN(id)) {
		return c.json({ message: "require[id]" }, 400);
	}
	const oSql = oCFD1.sql();
	oSql.from('mails');
	const aWhere = new Array<[string, any]>();
	aWhere.push(['id=?', [id]]);
	oSql.where(aWhere);
	oSql.buildSelect();
	console.log('执行的SQL语句', oCFD1.getSQL(oSql));
	const results = await oCFD1.first(oSql);
	if (!results) {
		return c.json({ message: `Id(${id}) Not found` }, 404);
	}
	return c.json(results);
});



export default app;
