import { Route } from '@/utils/route';
import { CFD1 } from '@/utils/cfd1';

const app = Route();

app.post('/gen_table', async (c) => {
	const oCFD1 = new CFD1(c.env.DB);
	const data = await c.req.json();
	const oSqlInsert = oCFD1.sql().from('pre_avue_gen_tables');
	oSqlInsert.set({
		name: data.name,
		desc: data.desc,
		out: {
			"view": "page",
			"type": "lib"
		},
		avueCrud: {
			"option": {
				"index": false,
				"menu": true,
				"addBtn": true,
				"editBtn": true,
				"delBtn": true,
				"viewBtn": true
			}
		},
	}).buildInsert();
	const r2 = await oCFD1.run(oSqlInsert);
	if (!r2.success) {
		return c.json({
			"code": "400",
			"success": false,
			"data": {}
		});
	}
	if (!r2.meta.last_row_id) {
		return c.json({
			"code": "404",
			"success": false,
			"data": {}
		});
	}
	return c.json({
		"code": "201",
		"success": true,
		"data": {
			id: r2.meta.last_row_id,
		}
	});
});

app.get('/gen_table', async (c) => {
	const oCFD1 = new CFD1(c.env.DB);
	const oSql = oCFD1.sql().from('pre_avue_gen_tables');
	const limit = Number(c.req.query('pageSize') || 10);
	const offset = (Number(c.req.query('page') || 1) - 1) * limit;
	const results = (await oCFD1.all(oSql.select({}).limit(limit).offset(offset).buildSelect())).results;
	for (const result of results) {
		result.out = JSON.parse(result.out?.toString() ?? "{}");
		result.avueCrud = JSON.parse(result.avueCrud?.toString() ?? "{}");
	}
	return c.json({
		"code": "200",
		"success": true,
		"data": {
			"count": (await oCFD1.first(oSql.select({ 'count': 'COUNT(*)' }).buildSelect()))?.count,
			results
		}
	});
});

app.put('/gen_table/:id', async (c) => {
	const oCFD1 = new CFD1(c.env.DB);
	const oSql = oCFD1.sql().from('pre_avue_gen_tables');
	const data = await c.req.json();
	delete data['id'];
	delete data['$cellEdit'];
	delete data['$index'];
	const r2 = await oCFD1.run(oSql.set(data).where([
		['id=?', [c.req.param('id')]],
	]).buildUpdate());
	if (!r2.success) {
		return c.json({
			"code": "400",
			"success": false,
			"data": {}
		});
	}
	return c.json({
		"code": "200",
		"success": true,
		"data": {}
	});
});

app.delete('/gen_table/:id', async (c) => {
	const oCFD1 = new CFD1(c.env.DB);
	const oSql = oCFD1.sql().from('pre_avue_gen_tables');
	oSql.where([
		['id=?', [c.req.param('id')]],
	])
	const r2 = await oCFD1.run(oSql.buildDelete());
	if (!r2.success) {
		return c.json({
			"code": "400",
			"success": false,
			"data": {}
		});
	}
	return c.json({
		"code": "200",
		"success": true,
		"data": {}
	});
});

app.post('/gen_column', async (c) => {
	const oCFD1 = new CFD1(c.env.DB);
	const data = await c.req.json();
	const oSqlInsert = oCFD1.sql().from('pre_avue_gen_columns');
	const gen_table_id = data.gen_tableId;
	delete data.gen_tableId;
	oSqlInsert.set({
		gen_table_id,
		data,
	}).buildInsert();
	const r2 = await oCFD1.run(oSqlInsert);
	if (!r2.success) {
		return c.json({
			"code": "400",
			"success": false,
			"data": {}
		});
	}
	if (!r2.meta.last_row_id) {
		return c.json({
			"code": "404",
			"success": false,
			"data": {}
		});
	}
	return c.json({
		"code": "201",
		"success": true,
		"data": {
			id: r2.meta.last_row_id,
		}
	});
});

app.get('/gen_column', async (c) => {
	const oCFD1 = new CFD1(c.env.DB);
	const oSql = oCFD1.sql().from('pre_avue_gen_columns');
	const limit = Number(c.req.query('pageSize') || 10);
	const offset = (Number(c.req.query('page') || 1) - 1) * limit;
	const results = (await oCFD1.all(oSql.select({}).limit(limit).offset(offset).buildSelect())).results;
	for (const result of results) {
		if (typeof (result.data) === 'string') {
			delete result.gen_table_id;
			const data = JSON.parse(result.data);
			delete result.data;
			for (const k in data) {
				result[k] = data[k];
			}
		}
	}
	return c.json({
		"code": "200",
		"success": true,
		"data": {
			"count": (await oCFD1.first(oSql.select({ 'count': 'COUNT(*)' }).buildSelect()))?.count,
			results
		}
	});
});

app.put('/gen_column/:id', async (c) => {
	const oCFD1 = new CFD1(c.env.DB);
	const oSql = oCFD1.sql().from('pre_avue_gen_columns');
	const data = await c.req.json();
	delete data['id'];
	delete data['gen_tableId'];
	const r2 = await oCFD1.run(oSql.set({
		data
	}).where([
		['id=?', [c.req.param('id')]],
	]).buildUpdate());
	if (!r2.success) {
		return c.json({
			"code": "400",
			"success": false,
			"data": {}
		});
	}
	return c.json({
		"code": "200",
		"success": true,
		"data": {}
	});
});

app.delete('/gen_column/:id', async (c) => {
	const oCFD1 = new CFD1(c.env.DB);
	const oSql = oCFD1.sql().from('pre_avue_gen_columns');
	oSql.where([
		['id=?', [c.req.param('id')]],
	])
	const r2 = await oCFD1.run(oSql.buildDelete());
	if (!r2.success) {
		return c.json({
			"code": "400",
			"success": false,
			"data": {}
		});
	}
	return c.json({
		"code": "200",
		"success": true,
		"data": {}
	});
});

export default app;
