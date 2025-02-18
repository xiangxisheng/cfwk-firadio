import type { ResJSON, ResJsonTableColumn, TableConfig } from '@/utils/common/api';

import { Route } from '@/utils/route';
import { CFD1 } from '@/utils/cfd1';
import { delay } from '@/utils/common/api';

export default function (config: TableConfig) {

	const app = Route();

	app.use(async (c, next) => {
		//await delay(1000);
		return await next();
	});

	app.post('/', async (c) => {
		// 这是“CRUDL”中的“Create”
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
		// 这是“CRUDL”中的“Delete”
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
		// 这是“CRUDL”中的“Read”
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
		// 这是“CRUDL”中的“Update”
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

	function deleteSqlOptionByColumns(columns: ResJsonTableColumn[]) {
		for (const column of columns) {
			delete column.sqlOption;
		}
	}

	app.get('/', async (c) => {
		// 这是“CRUDL”中的“List”
		let pageNum = Number(c.req.query('pageNum') ?? 1);
		let pageSize = Number(c.req.query('pageSize') ?? 10);
		if (pageNum < 1) { pageNum = 1; }
		if (pageSize < 1) { pageSize = 1; }
		if (pageSize > 1000) { pageSize = 1000; }
		const oCFD1 = new CFD1(c.env.DB);
		// 计算[总记录数]和[总页码数]
		const totalRecords = Number((await oCFD1.sql().from(config.name).select({ 'total': 'COUNT(*)' }).buildSelect().getStmt().first())?.total);
		const totalPages = Math.ceil(totalRecords / pageSize);
		if (pageNum > totalPages) { pageNum = totalPages; }
		// 开始输出列表
		const oSql = oCFD1.sql().from(config.name);
		oSql.offset((pageNum - 1) * pageSize);
		oSql.limit(pageSize);
		const select: Record<string, string> = {};
		for (const col of config.columns) {
			select[col.dataIndex] = col.dataIndex;
		}
		oSql.select(select);
		const aWhere: Array<[string, Array<string | number>]> = [];
		for (const col of config.columns) {
			if (!col.sqlOption) {
				continue;
			}
			const search_val = c.req.query(`${col.dataIndex}`);
			if (search_val) {
				aWhere.push([col.sqlOption.where, [search_val]]);
			}
		}
		oSql.where(aWhere);
		const dataSource = (await oSql.buildSelect().getStmt().all()).results;
		deleteSqlOptionByColumns(config.columns);
		const resJson: ResJSON = {
			table: {
				option: config.option,
				columns: config.columns,
				totalRecords,
				dataSource,
			},
		};
		return c.json(resJson);
	});

	return app;
}
