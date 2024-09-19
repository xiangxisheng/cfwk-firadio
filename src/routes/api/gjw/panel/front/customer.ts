import { Route } from '@/utils/route';
import { CFD1 } from '@/utils/cfd1';
import { cJson } from '@/utils/vben';

const app = Route();

app.get('/', async (c) => {
	const oCFD1 = new CFD1(c.env.DB);
	const oSql = oCFD1
		.sql()
		.from('pre_gjw_customers')
		.where([['uid=?', [c.get('user').uid]]])
		.buildSelect();
	const items = (await oSql.getStmt().all()).results;
	return cJson(c, { code: 0, type: 'success', message: '', result: { items } });
});

app.get('/:id', async (c) => {
	const oCFD1 = new CFD1(c.env.DB);
	const where: Array<[string, Array<string | number>]> = [];
	where.push(['id=?', [c.req.param('id')]]);
	where.push(['uid=?', [c.get('user').uid]]);
	const oSql = oCFD1.sql().from('pre_gjw_customers').where(where).buildSelect();
	const result = await oSql.getStmt().first();
	return cJson(c, { code: 0, type: 'success', message: '', result });
});

export default app;
