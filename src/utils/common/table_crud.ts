import { Route } from '@/utils/route';
import { CFD1 } from '@/utils/cfd1';
import type { ResJSON, TableConfig } from '@/utils/common/api';
import { delay } from '@/utils/common/api';

export default function (config: TableConfig) {

	const app = Route();

	app.use(async (c, next) => {
		//await delay(1000);
		return await next();
	});

	app.post('/', async (c) => {
		const json = await c.req.json();
		const oCFD1 = new CFD1(c.env.DB);
		const oSql = oCFD1.sql().from(config.name);
		const set: Record<string, string | number> = {};
		set.created = Date.now();
		for (const col of config.columns) {
			if (!col.component) {
				continue;
			}
			set[col.dataIndex] = json[col.dataIndex];
		}
		const sqlResult = await oCFD1.all(oSql.set(set).buildInsert());
		return c.json({
			message: '添加成功！',
		});
	});

	app.delete('/', async (c) => {
		const oCFD1 = new CFD1(c.env.DB);
		const oSql = oCFD1.sql().from(config.name);
		const json = await c.req.json();
		oSql.where([
			[`[${config.option.rowKey}] IN (*)`, json],
		]);
		const r = await oSql.buildDelete().getStmt().run();
		if (!r.success) {
			return c.json({
				"code": "400",
				"success": false,
			});
		}
		return c.json({
			message: '删除成功！',
		});
	});

	app.get('/:id', async (c) => {
		const id = c.req.param('id');
		const oCFD1 = new CFD1(c.env.DB);
		const oSql = oCFD1.sql().from(config.name);
		oSql.where([[`[${config.option.rowKey}]=?`, [id]]]);
		const select: Record<string, string> = {};
		for (const col of config.columns) {
			select[col.dataIndex] = col.dataIndex;
		}
		return c.json((await oSql.select(select).buildSelect().getStmt().first()));
	});

	app.put('/:id', async (c) => {
		const id = c.req.param('id');
		const json = await c.req.json();
		const oCFD1 = new CFD1(c.env.DB);
		const oSql = oCFD1.sql().from(config.name);
		oSql.where([['id=?', [id]]]);
		const set: Record<string, string | number> = {};
		set.updated = Date.now();
		for (const col of config.columns) {
			if (!col.component) {
				continue;
			}
			set[col.dataIndex] = json[col.dataIndex];
		}
		oSql.set(set);
		const r = await oSql.buildUpdate().getStmt().run();
		if (!r.success) {
			return c.json({
				"code": "400",
				"success": false,
			});
		}
		return c.json({
			message: '修改成功！',
		});
	});

	app.get('/', async (c) => {

		const oCFD1 = new CFD1(c.env.DB);
		const oSql = oCFD1.sql().from(config.name);
		const select: Record<string, string> = {};
		for (const col of config.columns) {
			select[col.dataIndex] = col.dataIndex;
		}
		const dataSource = (await oSql.select(select).buildSelect().getStmt().all()).results;
		const resJson: ResJSON = {
			table: {
				option: config.option,
				columns: config.columns,
				dataSource,
			},
		};
		return c.json(resJson);
	});

	return app;
}
