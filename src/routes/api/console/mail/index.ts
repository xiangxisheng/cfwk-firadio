import { Hono } from 'hono';
import { CFD1 } from '@/utils/cfd1';

const app = new Hono<{ Bindings: Env }>();

app.get("/", async (c) => {
	const oCFD1 = CFD1(c.env.DB);
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
	const oCFD1 = CFD1(c.env.DB);
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
