import { Route } from '@/utils/route';
import { CFD1 } from '@/utils/cfd1';
import { SQL } from '@/utils/sql';

const app = Route();

function getPathInfo(_path: string) {
	const path = _path.match(/([a-z_/]+)\/([0-9]+)/);
	if (!path) {
		throw new Error('path错误');
	}
	return {
		name: path[1],
		id: Number(path[2]),
	};
}

interface TableInfo {
	table: string,
	cols: Array<TableColumn>,
}

interface TableColumn {
	option: TableColumnOption,
}

interface TableColumnOption {
	prop: string,
	label?: string,
	format?: string,
	default?: object,
	search?: boolean,
	hide?: boolean,
}

async function getColumn(oCFD1: CFD1, gen_tableId: number): Promise<Array<TableColumn>> {
	const rows = (await oCFD1.all(oCFD1.sql().select({ option: 'option' }).from('pre_avue_gen_columns').where([['gen_tableId=?', [gen_tableId]]]).buildSelect())).results;
	const cols: Array<TableColumn> = [];
	for (const row of rows) {
		if (!row.option) {
			continue;
		}
		cols.push({
			option: JSON.parse(row.option.toString())
		});
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
		cols,
	};
	return ret;
}

async function moveTableSeq(oSql: SQL, id: number, _move: number) {
	const results = oSql.select({ id: 'id' }).orderBy([['seq', 'asc']]).buildSelect().getStmt().all();
	console.log(results);
}

function getColSet(cols: Array<TableColumn>) {
	const select: Record<string, string> = {};
	const colSet: Record<string, TableColumn> = {};
	for (const col of cols) {
		if (!col.option.prop) {
			continue;
		}
		colSet[col.option.prop] = col;
		select[col.option.prop] = col.option.prop;
	}
	return { colSet, select };
}

function procColumnData(colSet: Record<string, TableColumn>, data: Record<string, unknown>) {
	for (const fieldName in data) {
		if (!colSet[fieldName]) {
			continue;
		}
		if (colSet[fieldName].option.format === 'json') {
			data[fieldName] = JSON.parse(data[fieldName]?.toString() ?? "{}");
		}
	}
}

app.get(':path{([a-z_]+/)+[0-9]+}', async (c) => {
	const { name, id } = getPathInfo(c.req.param('path'));
	//console.log(`name=${name}, id=${id}`);
	const oCFD1 = new CFD1(c.env.DB);
	const { table, cols } = await getTableInfo(oCFD1, name);
	const oSql = oCFD1.sql().from(table);
	const limit = Number(c.req.query('pageSize') || 10);
	const offset = (Number(c.req.query('page') || 1) - 1) * limit;
	const { colSet, select } = getColSet(cols);
	const data = (await oCFD1.first(oSql.select(select).where([['id=?', [id]]]).limit(limit).offset(offset).buildSelect()));
	if (!data) {
		throw new Error(`id=[${id}]没有找到这条记录`);
	}
	procColumnData(colSet, data);
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
	const { table } = await getTableInfo(oCFD1, name);
	const oSql = oCFD1.sql().from(table);
	const _move = c.req.query('_move');
	if (_move) {
		await moveTableSeq(oSql, id, Number(_move));
		return c.json({
			"code": "200",
			"success": true,
			"data": {}
		});
	}
	const data = await c.req.json();
	const r2 = await oSql.set(data).where([
		['id=?', [id]],
	]).buildUpdate().getStmt().run();
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
	const r2 = await oSql.buildDelete().getStmt().run();
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
	if (post[col.option.prop]) {
		return post[col.option.prop];
	}
	if (col.option.default) {
		return col.option.default;
	}
	return null;
}

app.get(':path{([a-z_]+/)*([a-z_]+)}', async (c) => {
	const name = c.req.param('path');
	const oCFD1 = new CFD1(c.env.DB);
	const { table, cols } = await getTableInfo(oCFD1, name);
	const limit = Number(c.req.query('pageSize') || 10);
	const offset = (Number(c.req.query('page') || 1) - 1) * limit;
	const where: Array<[string, Array<string | number>]> = [];
	for (const col of cols) {
		if (!col.option.prop) {
			continue;
		}
		const propVal = c.req.query(col.option.prop);
		if (propVal) {
			where.push([`${col.option.prop}=?`, [propVal]]);
		}
	}
	const { colSet, select } = getColSet(cols);
	const results = (await oCFD1.sql().select(select).from(table).where(where).limit(limit).offset(offset).buildSelect().getStmt().all()).results;
	for (const result of results) {
		procColumnData(colSet, result);
	}
	return c.json({
		"code": "200",
		"success": true,
		"data": {
			"count": (await oCFD1.sql().select({ 'count': 'COUNT(*)' }).from(table).where(where).buildSelect().getStmt().first())?.count,
			results,
		}
	});
}).post(async (c) => {
	const name = c.req.param('path');
	const oCFD1 = new CFD1(c.env.DB);
	const { table, cols } = await getTableInfo(oCFD1, name);
	const data = await c.req.json();
	const oSqlInsert = oCFD1.sql().from(table);
	const set: Record<string, unknown> = {};
	for (const col of cols) {
		if (!col.option.prop) {
			continue;
		}
		set[col.option.prop] = getValue(data, col);
		delete data[col.option.prop];
	}
	oSqlInsert.set(set).buildInsert();
	const r2 = await oSqlInsert.getStmt().run();
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
