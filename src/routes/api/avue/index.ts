import { Route } from '@/utils/route';
import { CFD1 } from '@/utils/cfd1';

const app = Route();

function getPathInfo(_path: string) {
	const path = _path.match(/([a-z_/]+)\/([0-9]+)/);
	if (!path) {
		throw new Error('path错误');
	}
	return {
		name: path[1],
		id: path[2]
	};
}

interface TableInfo {
	table: string,
	cols: Array<TableColumn>,
	jsonField: string,
}

interface TableColumn {
	prop: string,
	label?: string,
	format?: string,
	default?: object,
	search?: boolean,
	hide?: boolean,
}

async function getColumn(oCFD1: CFD1, gen_tableId: number): Promise<Array<TableColumn>> {
	const rows = (await oCFD1.all(oCFD1.sql().from('pre_avue_gen_columns').where([['gen_tableId=?', [gen_tableId]]]).buildSelect())).results;
	const cols: Array<TableColumn> = [];
	for (const row of rows) {
		if (row.data) {
			cols.push(JSON.parse(row.data.toString()));
		}
	}
	return cols;
}

async function getTableInfo(oCFD1: CFD1, name: string): Promise<TableInfo> {
	const rowTable = (await oCFD1.first(oCFD1.sql().from('pre_avue_gen_tables').where([['name=?', [name]]]).buildSelect()));
	if (!rowTable) {
		throw new Error(`表名称name=[${name}]未找到`);
	}
	if (!rowTable.id) {
		throw new Error(`表名称name=[${name}]未找到,没有ID号`);
	}
	if (!rowTable.out) {
		throw new Error(`表out配置丢失`);
	}
	const out = JSON.parse(rowTable.out.toString());
	const cols = await getColumn(oCFD1, Number(rowTable.id));
	const ret: TableInfo = {
		table: out.table,
		jsonField: out.jsonField,
		cols,
	};
	return ret;
}

app.get(':path{([a-z_]+/)+[0-9]+}', async (c) => {
	const { name, id } = getPathInfo(c.req.param('path'));
	//console.log(`name=${name}, id=${id}`);
	const oCFD1 = new CFD1(c.env.DB);
	const { table, cols } = await getTableInfo(oCFD1, name);
	const oSql = oCFD1.sql().from(table);
	const limit = Number(c.req.query('pageSize') || 10);
	const offset = (Number(c.req.query('page') || 1) - 1) * limit;
	const select: Record<string, string> = {};
	select['id'] = 'id';
	const colSet: Record<string, TableColumn> = {};
	for (const col of cols) {
		if (!col.prop) {
			continue;
		}
		colSet[col.prop] = col;
		select[col.prop] = col.prop;
	}
	const data = (await oCFD1.first(oSql.select(select).where([['id=?', [id]]]).limit(limit).offset(offset).buildSelect()));
	if (!data) {
		throw new Error(`id=[${id}]没有找到这条记录`);
	}
	for (const fieldName in data) {
		if (!colSet[fieldName]) {
			continue;
		}
		if (colSet[fieldName].format === 'json') {
			data[fieldName] = JSON.parse(data[fieldName]?.toString() ?? "{}");
		}
	}
	if (c.req.query('_embed') === 'gen_column') {
		data.gen_column = await getColumn(oCFD1, Number(id));
	}
	return c.json({
		"code": "200",
		"success": true,
		data
	});
}).put(async (c) => {
	const { name, id } = getPathInfo(c.req.param('path'));
	//console.log(`name=${name}, id=${id}`);
	const oCFD1 = new CFD1(c.env.DB);
	const { table, jsonField } = await getTableInfo(oCFD1, name);
	const oSql = oCFD1.sql().from(table);
	const data = await c.req.json();
	delete data['id'];
	delete data['$cellEdit'];
	delete data['$index'];
	const set = (() => {
		if (data['gen_tableId'] && jsonField) {
			delete data['gen_tableId'];
			const set: Record<string, unknown> = {};
			set[jsonField] = data;
			return set;
		}
		return data;
	})();
	const r2 = await oCFD1.run(oSql.set(set).where([
		['id=?', [id]],
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
}).delete(async (c) => {
	const { name, id } = getPathInfo(c.req.param('path'));
	//console.log(`name=${name}, id=${id}`);
	const oCFD1 = new CFD1(c.env.DB);
	const { table } = await getTableInfo(oCFD1, name);
	const oSql = oCFD1.sql().from(table);
	oSql.where([
		['id=?', [id]],
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

function getValue(post: any, col: TableColumn) {
	if (post[col.prop]) {
		return post[col.prop];
	}
	if (col.default) {
		return col.default;
	}
	return null;
}

function getJsonResult(results: Record<string, unknown>[], jsonField: string) {
	const rows: Array<Record<string, unknown>> = [];
	for (const result of results) {
		const json = result[jsonField]?.toString();
		if (json) {
			const data = JSON.parse(json.toString());
			data.id = result.id;
			rows.push(data);
		}
	}
	return rows;
}

app.get(':path{([a-z_]+/)*([a-z_]+)}', async (c) => {
	const name = c.req.param('path');
	const oCFD1 = new CFD1(c.env.DB);
	const { table, cols, jsonField } = await getTableInfo(oCFD1, name);
	const limit = Number(c.req.query('pageSize') || 10);
	const offset = (Number(c.req.query('page') || 1) - 1) * limit;
	const where: Array<[string, Array<string | number>]> = [];
	const select: Record<string, string> = {};
	select['id'] = 'id';
	const colSet: Record<string, TableColumn> = {};
	for (const col of cols) {
		if (!col.prop) {
			continue;
		}
		const propVal = c.req.query(col.prop);
		if (propVal) {
			where.push([`${col.prop}=?`, [propVal]]);
		}
		colSet[col.prop] = col;
		select[col.prop] = col.prop;
	}
	const results = ((results) => {
		if (c.req.query('gen_tableId') && jsonField) {
			return getJsonResult(results, jsonField);
		}
		for (const result of results) {
			//result.out = JSON.parse(result.out?.toString() ?? "{}");
			//result.avueCrud = JSON.parse(result.avueCrud?.toString() ?? "{}");
		}
		return results;
	})((await oCFD1.all(oCFD1.sql().select(select).from(table).where(where).limit(limit).offset(offset).buildSelect())).results);
	return c.json({
		"code": "200",
		"success": true,
		"data": {
			"count": (await oCFD1.first(oCFD1.sql().select({ 'count': 'COUNT(*)' }).from(table).where(where).buildSelect()))?.count,
			results,
		}
	});
}).post(async (c) => {
	const name = c.req.param('path');
	const oCFD1 = new CFD1(c.env.DB);
	const { table, cols, jsonField } = await getTableInfo(oCFD1, name);
	const data = await c.req.json();
	const gen_tableId = data['gen_tableId'];
	const oSqlInsert = oCFD1.sql().from(table);
	const set: Record<string, unknown> = {};
	for (const col of cols) {
		if (!col.prop) {
			continue;
		}
		set[col.prop] = getValue(data, col);
		delete data[col.prop];
	}
	if (gen_tableId && jsonField) {
		set[jsonField] = data;
	}
	oSqlInsert.set(set).buildInsert();
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

export default app;
