import { Route } from '@/utils/route';
import { CFD1 } from '@/utils/cfd1';
import { cJson } from '@/utils/vben';

const app = Route();

app.get('/', async (c) => {
	const oCFD1 = new CFD1(c.env.DB);
	const where: Array<[string, Array<string | number>]> = [];
	where.push(['uid=?', [c.get('user').uid]]);
	where.push(['deleted=0', []]);
	const oSql = oCFD1.sql().from('pre_gjw_customers').where(where).buildSelect();
	const items = (await oSql.getStmt().all()).results;
	for (const item of items) {
		item.detail = typeof item?.detail === 'string' ? JSON.parse(item.detail) : {};
	}
	return cJson(c, { code: 0, type: 'success', message: '', result: { items } });
});

app.post('/', async (c) => {
	const oCFD1 = new CFD1(c.env.DB);
	const set: Record<string, unknown> = {};
	set.created = Date.now();
	set.uid = c.get('user').uid;
	const reqJson = await c.req.json();
	set.name = reqJson['name'];
	set.detail = reqJson['detail'];
	const oSql = oCFD1.sql().from('pre_gjw_customers').set(set).buildInsert();
	const result = await oSql.getStmt().run();
	return cJson(c, { code: 0, type: 'success', message: '', result });
});

app.get('/:id', async (c) => {
	const oCFD1 = new CFD1(c.env.DB);
	const where: Array<[string, Array<string | number>]> = [];
	where.push(['id=?', [c.req.param('id')]]);
	where.push(['uid=?', [c.get('user').uid]]);
	where.push(['deleted=0', []]);
	const oSql = oCFD1.sql().from('pre_gjw_customers').where(where).buildSelect();
	const result = await oSql.getStmt().first();
	if (!result) {
		return cJson(c, { code: 0, type: 'error', message: '指定的客户ID不存在', result: null });
	}
	result.detail = typeof result?.detail === 'string' ? JSON.parse(result.detail) : {};
	return cJson(c, { code: 0, type: 'success', message: '', result });
});

app.put('/:id', async (c) => {
	const oCFD1 = new CFD1(c.env.DB);
	const where: Array<[string, Array<string | number>]> = [];
	where.push(['id=?', [c.req.param('id')]]);
	where.push(['uid=?', [c.get('user').uid]]);
	where.push(['deleted=0', []]);
	const set: Record<string, unknown> = {};
	set.updated = Date.now();
	const reqJson = await c.req.json();
	set.name = reqJson['name'];
	set.detail = reqJson['detail'];
	const oSql = oCFD1.sql().from('pre_gjw_customers').where(where).set(set).buildUpdate();
	const result = await oSql.getStmt().run();
	return cJson(c, { code: 0, type: 'success', message: '', result });
});

app.delete('/:id', async (c) => {
	const oCFD1 = new CFD1(c.env.DB);
	const where: Array<[string, Array<string | number>]> = [];
	where.push(['id=?', [c.req.param('id')]]);
	where.push(['uid=?', [c.get('user').uid]]);
	where.push(['deleted=0', []]);
	const set: Record<string, unknown> = {};
	set.deleted = Date.now();
	const oSql = oCFD1.sql().from('pre_gjw_customers').where(where).set(set).buildUpdate();
	// console.log('执行的SQL语句', oSql.getSQL());
	const result = await oSql.getStmt().run();
	return cJson(c, { code: 0, type: 'success', message: '', result });
});

export default app;
